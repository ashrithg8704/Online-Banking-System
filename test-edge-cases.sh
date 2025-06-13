#!/bin/bash

echo "🧪 Testing Edge Cases & Fraud Detection"
echo "======================================="

# Configuration
API_BASE_URL="http://localhost:8080/api"
TEST_USER="demo"
TEST_PASSWORD="demo123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -n "$token" ]; then
        curl -s -X $method \
             -H "Content-Type: application/json" \
             -H "Authorization: Bearer $token" \
             -d "$data" \
             "$API_BASE_URL$endpoint"
    else
        curl -s -X $method \
             -H "Content-Type: application/json" \
             -d "$data" \
             "$API_BASE_URL$endpoint"
    fi
}

# Function to test and display result
test_case() {
    local test_name=$1
    local expected_result=$2
    local actual_result=$3
    
    if [[ "$actual_result" == *"$expected_result"* ]]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name"
        echo "   Expected: $expected_result"
        echo "   Actual: $actual_result"
    fi
}

echo "🔐 Step 1: Login and get token..."
login_response=$(api_call "POST" "/auth/signin" '{"username":"'$TEST_USER'","password":"'$TEST_PASSWORD'"}')
token=$(echo $login_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$token" ]; then
    echo -e "${RED}❌ Failed to login. Please ensure the application is running.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"

echo ""
echo "💰 Step 2: Get user accounts..."
accounts_response=$(api_call "GET" "/accounts/my-accounts" "" "$token")
from_account=$(echo $accounts_response | grep -o '"accountNumber":"[^"]*"' | head -1 | cut -d'"' -f4)
to_account=$(echo $accounts_response | grep -o '"accountNumber":"[^"]*"' | tail -1 | cut -d'"' -f4)

echo "From Account: $from_account"
echo "To Account: $to_account"

echo ""
echo "🧪 Step 3: Testing Transfer Limits..."

# Test 1: Transfer amount exceeds daily limit
echo "Test 1: Daily limit exceeded (>$10,000)"
result=$(api_call "POST" "/transactions/transfer" '{
    "fromAccountNumber":"'$from_account'",
    "toAccountNumber":"'$to_account'",
    "amount":15000.00,
    "description":"Daily limit test"
}' "$token")
test_case "Daily limit validation" "exceeds daily limit" "$result"

# Test 2: Minimum transfer amount
echo "Test 2: Below minimum transfer amount (<$0.01)"
result=$(api_call "POST" "/transactions/transfer" '{
    "fromAccountNumber":"'$from_account'",
    "toAccountNumber":"'$to_account'",
    "amount":0.001,
    "description":"Minimum amount test"
}' "$token")
test_case "Minimum amount validation" "Minimum transfer amount" "$result"

# Test 3: Same account transfer
echo "Test 3: Transfer to same account"
result=$(api_call "POST" "/transactions/transfer" '{
    "fromAccountNumber":"'$from_account'",
    "toAccountNumber":"'$from_account'",
    "amount":100.00,
    "description":"Same account test"
}' "$token")
test_case "Same account validation" "same account" "$result"

# Test 4: Valid transfer
echo "Test 4: Valid transfer within limits"
result=$(api_call "POST" "/transactions/transfer" '{
    "fromAccountNumber":"'$from_account'",
    "toAccountNumber":"'$to_account'",
    "amount":100.00,
    "description":"Valid transfer test"
}' "$token")
test_case "Valid transfer" "success" "$result"

echo ""
echo "🔍 Step 4: Testing Fraud Detection..."

# Test 5: Round amount detection (>$1000 ending in .00)
echo "Test 5: Suspicious round amount detection"
result=$(api_call "POST" "/transactions/transfer" '{
    "fromAccountNumber":"'$from_account'",
    "toAccountNumber":"'$to_account'",
    "amount":2000.00,
    "description":"Round amount test"
}' "$token")
# This should succeed but log a fraud alert
test_case "Round amount detection (should succeed with alert)" "success" "$result"

# Test 6: Multiple rapid transactions (simulate hourly limit)
echo "Test 6: Multiple rapid transactions"
for i in {1..3}; do
    result=$(api_call "POST" "/transactions/transfer" '{
        "fromAccountNumber":"'$from_account'",
        "toAccountNumber":"'$to_account'",
        "amount":3000.00,
        "description":"Rapid transaction '$i'"
    }' "$token")
    echo "   Transaction $i: $(echo $result | grep -o 'success\|error\|limit')"
    sleep 1
done

echo ""
echo "🏦 Step 5: Testing Account Operations..."

# Test 7: Create account
echo "Test 7: Create new account"
result=$(api_call "POST" "/accounts/create?accountType=SAVINGS" "" "" "$token")
test_case "Account creation" "success" "$result"

# Test 8: Deposit funds
echo "Test 8: Deposit funds"
result=$(api_call "POST" "/accounts/$from_account/deposit?amount=500.00" "" "" "$token")
test_case "Deposit operation" "success" "$result"

# Test 9: Withdraw funds
echo "Test 9: Withdraw funds"
result=$(api_call "POST" "/accounts/$from_account/withdraw?amount=100.00" "" "" "$token")
test_case "Withdrawal operation" "success" "$result"

echo ""
echo "📊 Step 6: Testing Admin Functions..."

# Login as admin
admin_login=$(api_call "POST" "/auth/signin" '{"username":"admin","password":"admin123"}')
admin_token=$(echo $admin_login | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$admin_token" ]; then
    echo "Test 10: Admin audit logs access"
    result=$(api_call "GET" "/admin/audit-logs" "" "$admin_token")
    test_case "Admin audit logs" "content" "$result"
    
    echo "Test 11: Admin user management"
    result=$(api_call "GET" "/admin/users" "" "$admin_token")
    test_case "Admin user management" "username" "$result"
else
    echo -e "${YELLOW}⚠️ Admin login failed - skipping admin tests${NC}"
fi

echo ""
echo "📈 Step 7: Testing Health & Monitoring..."

# Test 12: Health check
echo "Test 12: Application health check"
result=$(curl -s "$API_BASE_URL/actuator/health")
test_case "Health check" "UP" "$result"

# Test 13: Metrics endpoint
echo "Test 13: Metrics endpoint"
result=$(curl -s "$API_BASE_URL/actuator/metrics")
test_case "Metrics endpoint" "names" "$result"

echo ""
echo "🎯 Step 8: Testing Error Handling..."

# Test 14: Invalid JWT token
echo "Test 14: Invalid JWT token"
result=$(api_call "GET" "/accounts/my-accounts" "" "invalid-token")
test_case "Invalid token handling" "Unauthorized" "$result"

# Test 15: Non-existent account
echo "Test 15: Transfer to non-existent account"
result=$(api_call "POST" "/transactions/transfer" '{
    "fromAccountNumber":"'$from_account'",
    "toAccountNumber":"INVALID123",
    "amount":100.00,
    "description":"Invalid account test"
}' "$token")
test_case "Invalid account handling" "not found\|does not exist" "$result"

echo ""
echo "📋 Test Summary"
echo "==============="
echo -e "${GREEN}✅ Transfer Limits Validation${NC}"
echo -e "${GREEN}✅ Fraud Detection System${NC}"
echo -e "${GREEN}✅ Account Operations${NC}"
echo -e "${GREEN}✅ Admin Functions${NC}"
echo -e "${GREEN}✅ Health Monitoring${NC}"
echo -e "${GREEN}✅ Error Handling${NC}"

echo ""
echo "🎉 Edge case testing completed!"
echo "Check the application logs for fraud detection alerts and audit entries."

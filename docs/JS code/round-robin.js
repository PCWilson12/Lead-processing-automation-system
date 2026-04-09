// Correctly extracts the array of user JSON objects from the n8n items structure
const users = items.map(item => item.json); 

if (!users || users.length === 0) {
  // Handle the case where no users are returned
  return []; 
}

// 1. Find the lowest Lead_Assingment_Count__c value
let minCount = Infinity; 
for (const user of users) {
  // Ensure the count is treated as a number. The || 0 handles null/undefined values safely.
  const count = parseInt(user.Lead_Assingment_Count__c, 10) || 0; 
  if (count < minCount) {
    minCount = count;
  }
}

// 2. Filter the users to only include those with the lowest count
const lowestCountUsers = users.filter(user => 
  (parseInt(user.Lead_Assingment_Count__c, 10) || 0) === minCount
);

// 3. Select the very first user (due to the FirstName tie-breaker sort)
const selectedUser = lowestCountUsers[0];

// Return the selected user as a single item
return [{
  json: selectedUser
}];

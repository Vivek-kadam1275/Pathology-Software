// EVENT LISTENER FOR PRINTING PAGE:
const button = document.getElementById('btn');
const buttonAdd = document.getElementById('add');
const body = document.querySelector('body');
const inputs = document.querySelectorAll('input');

button.addEventListener('click', () => {
  button.classList.add('addButton');
  buttonAdd.classList.add('addButton'); 
   body.classList.add('addBody');
   window.print();
  button.classList.add('addButton1');
  buttonAdd.classList.add('addButton1');
   body.classList.add('addBody1');
})

// var prices=[200,100,100,1000,200];
// Function to create options for select element
// function createOptionsPrice(){
//   var options='';
//   for(var i=0;i<prices.length;i++){
//     options += '<option value="' + prices[i] + '">' + prices[i] + '</option>';
//   }
//   return options;
// }

// Add total price display element
var sum=document.getElementById('sum');
var totalPriceElement = document.createElement('p');
totalPriceElement.textContent = '';
totalPriceElement.id = 'totalPrice';
sum.appendChild(totalPriceElement);

function calculateTotalPrice() {
  var total = 0;
  var priceSelects = document.querySelectorAll('#tableBody select[name="price"]');
  priceSelects.forEach(function (select) {
    total += parseFloat(select.value);
  });
  return total.toFixed(2); // Return the total price rounded to 2 decimal places
}
// Function to update the total price display
function updateTotalPrice() {
  var totalPriceElement = document.getElementById('totalPrice');
  if (totalPriceElement) {
    totalPriceElement.textContent = calculateTotalPrice();
  }
}

// Event listener for select elements to update total price when selection changes
document.querySelectorAll('#tableBody select').forEach(function (select) {
  select.addEventListener('change', function () {
    updateTotalPrice();
  });
});



// ONCLICK EVENT LISTENER FUNCTION FOR ADDING ROW OF TEST AND PRICE
function addRow() {
  // alert('hello'); 
  var tableBody = document.getElementById("tableBody");

  var newRow = document.createElement('tr');

  var serialCell = document.createElement('td');
  serialCell.textContent = tableBody.children.length + 1;
  newRow.appendChild(serialCell);

  var testCell = document.createElement('td');
  var selectTest = document.createElement('select');
  // selectTest.innerHTML = createOptionsTest();
  fetch('/test') // Fetch test names from the server
    .then(response => response.json())
    .then(testNames => {
      testNames.forEach(testName => {
        var option = document.createElement('option');
        option.textContent = testName;
        selectTest.appendChild(option);
      });
      // Update total price when test is added
      updateTotalPrice();
    })
    .catch(error => console.error('Error fetching test names:', error));
  testCell.appendChild(selectTest);
  newRow.appendChild(testCell);

  var priceCell = document.createElement('td');
  var selectPrice = document.createElement('select');
  selectPrice.setAttribute('name', 'price')
  // selectPrice.innerHTML=createOptionsPrice();
  fetch('/price') // Fetch test names from the server
    .then(response => response.json())
    .then(priceNames => {
      priceNames.forEach(priceName => {
        var option = document.createElement('option');
        option.textContent = priceName;
        selectPrice.appendChild(option);
      });
      updateTotalPrice();
    })
    .catch(error => console.error('Error fetching test names:', error));
  priceCell.appendChild(selectPrice);
  newRow.appendChild(priceCell);

  var deleteCell = document.createElement('td');
  var deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
   deleteButton.setAttribute('onclick','Delete('+tableBody.children.length+')');
  deleteCell.appendChild(deleteButton);
  newRow.appendChild(deleteCell);

  tableBody.appendChild(newRow);

  // Update total price when row is added
  updateTotalPrice();
  };

function Delete(dd){
   document.getElementById('tableBody').deleteRow(dd);
}











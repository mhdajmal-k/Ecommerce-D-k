function validateForm(e) {
    const productTitle = document.getElementById('product_title').value.trim();
    const description = document.getElementById('description').value.trim();
    const errorMessageElement = document.getElementById('categoryNameError');
    const categoryDescriptionError = document.getElementById("categoryDescriptionError");

    errorMessageElement.style.display = "none";
    errorMessageElement.innerHTML = "";
    categoryDescriptionError.style.display = "none";
    categoryDescriptionError.innerHTML = "";

    if (productTitle === "") {
        errorMessageElement.style.display = "block";
        errorMessageElement.innerHTML = "Product title is required1";
        e.preventDefault();
    } else if (description === "" ) {
        categoryDescriptionError.style.display = "block";
        categoryDescriptionError.innerHTML = "Description is required2";
        e.preventDefault();
    }
    else if(productTitle.length>20){
        errorMessageElement.style.display = "block";
        errorMessageElement.innerHTML = "product tittle must be short3";
        e.preventDefault();
    }
}

// Add event listener to the form submission
document.getElementById('myForm').addEventListener('submit', function(event) {
    validateForm(event);
});

         

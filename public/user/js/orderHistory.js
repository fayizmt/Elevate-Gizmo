
function confirmCancellation(id) {
  swal({
      title: "Are you sure?",
      text: "Once cancelled, you will not be able to recover this order!",
      icon: "warning",
      buttons: ["Cancel", "Yes, cancel it!"],
      dangerMode: true,
  })
  .then((willCancel) => {
      if (willCancel) {
          fetch(`/cancelOrder/${id}`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json"
              }
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.json();
          })
          .then(data => {
            
            updateOrderStatus();
          })
          .catch(error => {
              console.error('There was a problem with the fetch operation:', error);
          });
      }
  });
}

function updateOrderStatus(cancelledOrderId) {
    const cancelBtn = document.querySelector(`.cancel-btn[data-order-id="${cancelledOrderId}"]`);
    if (cancelBtn) {
      cancelBtn.style.backgroundColor = "#dad7cd";
      cancelBtn.innerText = "Cancelled";
      cancelBtn.removeAttribute("onclick");
      cancelBtn.disabled = true;
    }
  }
  

  // Update other UI elements here if needed


// Call updateOrderStatus initially to handle the case when the page loads

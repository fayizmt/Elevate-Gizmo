document.addEventListener("DOMContentLoaded", () => {
  // Get the order status from your server-side code and pass it to updateOrderStatus
  const orderStatus = "<%= obj.orderStatus.toLowerCase() %>";
  updateOrderStatus(orderStatus);
});

// Function to update the UI elements based on the order status
function updateOrderStatus(orderStatus) {
  const circle1 = document.querySelector(".circle.Placed");
  const circle2 = document.querySelector(".circle.Shipped");
  const circle3 = document.querySelector(".circle.Delivered");
  const stick1 = document.querySelector(".stick.placed");
  const stick2 = document.querySelector(".stick.shipped");

  // Reset all circles and sticks
  [circle1, circle2, circle3].forEach(circle => {
      circle.classList.remove("active");
  });
  [stick1, stick2].forEach(stick => {
      stick.style.backgroundColor = "#ccc";
  });

  // Update circles and sticks based on order status
  if (orderStatus === 'Placed') {
      circle1.classList.add("active");
  } else if (orderStatus === 'Shipped'||orderStatus === 'Out for Delivery') {
      circle1.classList.add("active");
      circle2.classList.add("active");
      stick1.style.backgroundColor = "#70e000";
  } else if (orderStatus === 'Delivered') {
      circle1.classList.add("active");
      circle2.classList.add("active");
      circle3.classList.add("active");
      stick1.style.backgroundColor = "#70e000";
      stick2.style.backgroundColor = "#70e000";
  }
}
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

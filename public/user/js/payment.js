document.getElementById('submit').addEventListener('click',  ()=> {

    fetch('paymentComplete', {
        method: 'POST',
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(function (data) {
          console.log(data);
          var options = {
            key: data.data.key,
            amount: data.order.amount,
            currency: data.order.currency,
            order_id: data.order.id,
            image: '',
            name: 'ElevateGizmo',
            description: 'Payment for your order',
            handler: function (response) {
              console.log('Razorpay payment success:', response);
              let payment = 'upi';
              window.location.href = '/orderComplete/' + encodeURIComponent(payment);
            },
            prefill: {
              name: data.data.name,
              email: data.data.email,
              contact: data.data.contact,
            },
            theme: {
              color: '#ffb703',
            },
          };
          var rzp = new Razorpay(options);
          rzp.open();
        })
        .catch(function (error) {
          console.error('Error creating Razorpay order:', error);
        });
    });
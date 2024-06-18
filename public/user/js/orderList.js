
        document.getElementById('statusFilter').addEventListener('change', function () {
            let selectedStatus = this.value;
            let orderCards = document.querySelectorAll('.card');

            orderCards.forEach(card => {
                let cardStatus = card.getAttribute('data-status');
                if (selectedStatus === 'all' || cardStatus === selectedStatus) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });

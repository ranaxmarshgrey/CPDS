// script.js
document.addEventListener('DOMContentLoaded', () => {
  const customerForm = document.getElementById('customerForm');
  if (customerForm) {
    customerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const address = document.getElementById('address').value.trim();
      const phone = document.getElementById('phone').value.trim();

      if (!name || !address || !phone) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Fields',
          text: 'Please fill in all details!',
        });
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, address, phone }),
        });

        const data = await res.json();

        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Customer Added!',
            text: data.message || 'Customer added successfully.',
            timer: 2000,
            showConfirmButton: false,
          });
          customerForm.reset();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || 'Something went wrong.',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: 'Unable to connect to server.',
        });
      }
    });
  }
});

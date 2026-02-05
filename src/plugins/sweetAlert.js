import Swal from 'sweetalert2'

export const useSweetAlert = () => {
  const isMobile = window.innerWidth <= 600; // Check if the view is mobile
  const width = isMobile ? '80%' : '400px';
  const padding = isMobile ? '8px 10px' : '15px 30px';

  return Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    showCloseButton: true,
    timerProgressBar: true,
    background: '#1d202c', 
    color: '#fff', 
    width: width,
    padding: padding,
    customClass: {
      popup: 'custom-toast' // Custom class for styling
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
}

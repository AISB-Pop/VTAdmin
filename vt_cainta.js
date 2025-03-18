    // Initialize the viewer with the hotspot
    var viewer = pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": "m_boardroom.jpg",  // Set the initial panorama image
        "autoLoad": true,
      });
  
      // Function to change the image when a gallery image is clicked
      function changeImage(clickedImage) {
        // Remove gold border from all images
        const allImages = document.querySelectorAll('.gallery-image');
        allImages.forEach(image => {
          image.classList.remove('gold-border');
        });
  
        // Add gold border to the clicked image
        clickedImage.classList.add('gold-border');
  
        // Update the panorama viewer with the clicked image
        const imageSrc = clickedImage.src;
        viewer.destroy(); // Destroy the existing viewer instance
        viewer = pannellum.viewer('panorama', {
          "type": "equirectangular",
          "panorama": imageSrc,
          "autoLoad": true
        });
      }
  
      // Function to scroll the image gallery left or right
      function scrollGallery(direction) {
        const container = document.querySelector('.images-container');
        const scrollAmount = 250; // Adjust this value to fit the images better
        if (direction === 'left') {
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
  

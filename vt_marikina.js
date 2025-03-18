// Define hotspots for each panorama
const hotspotsData = {
    "m_ground_lobby.jpg": [
      {
        id: "groundLobbyRight",
        pitch: -158,
        yaw: -85,
        type: "custom",  
        url: "m_mainentrance.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-arrow-up",  // Optional: Custom class for styling the hotspot
      },
      {
        id: "groundLobbyLeft",
        pitch: -158,
        yaw: 91,
        type: "custom",  
        url: "m_quadrangle.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-arrow-up",  
      },
      {
        id: "groundLobbyMiddle",
        pitch: -148,
        yaw: 159,
        type: "custom",  
        url: "m_ground_library.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-arrow-up",  
      },
      {
        id: "groundLobbyMiddleRight",
        pitch: -163,
        yaw: 215,
        type: "custom",  
        url: "m_guidance.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-arrow-left-custom",  
      },
      {
        id: "groundLobbyDocument",
        pitch: -181,
        yaw: 47.5,
        type: "custom",  
        clickHandlerFunc: function() {
          openPopupMessage();
        },
        cssClass: "custom-document",  
      }
    ],
    "m_quadrangle.jpg": [
      {
        id: "quadrangleLeft",
        pitch: -176,
        yaw: 104,
        type: "custom",  
        url: "m_drawingroom.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-arrow-quad",  
      },
      {
        id: "quadrangleMiddleRight",
        pitch: -176,
        yaw: 173,
        type: "custom",  
        url: "m_gymnasium.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-arrow-right-custom",  
      },
      {
        id: "quadrangleLeftMiddle",
        pitch: -173,
        yaw: 141,
        type: "custom",  
        url: "m_ground_hallway.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-arrow-quad",  
      },
      {
        id: "quadrangleRight",
        pitch: -171,
        yaw: -65,
        type: "custom",  
        url: "m_playground.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-arrow-quad",  
      }
    ],
    "m_drawingroom.jpg": [
      {
        id: "drawingroomArrow",
        pitch: -170,
        yaw: 143,
        type: "custom",  
        url: "m_quadrangle.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-exit",  
      }
    ],
    "m_classroom.jpg": [
      {
        id: "classroomArrow",
        pitch: -178,
        yaw: 195,
        type: "custom",  
        url: "m_6thfloor_hallway.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-exit",  
      }
    ],
    "m_physicslab.jpg": [
      {
        id: "physicslabArrow",
        pitch: -173,
        yaw: 258,
        type: "custom",  
        url: "m_4thfloor_hallway.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-exit",  
      }
    ],
    "m_boardroom.jpg": [
      {
        id: "boardroomArrow",
        pitch: -163,
        yaw: 235,
        type: "custom",  
        url: "m_6thfloor_lobby.jpg",  // Next panorama URL
        clickHandlerFunc: function() {
          const newPanorama = this.url;  // Get the URL of the new panorama
  
          // Destroy the existing viewer instance
          viewer.destroy();
  
          // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
          viewer = pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": newPanorama,  // Set the new panorama
            "autoLoad": true,
            "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
            "showControls": true
          });
  
          // Update the image holder and apply the gold border based on the new panorama URL
          const allImages = document.querySelectorAll('.gallery-image');
          allImages.forEach(image => {
            image.classList.remove('gold-border');  // Remove gold border from all images
          });
  
          // Find the corresponding image in the gallery and add the gold border
          const galleryImages = document.querySelectorAll('.gallery-image');
          galleryImages.forEach(image => {
            if (image.src.includes(newPanorama)) {
              image.classList.add('gold-border');  // Add the gold border to the clicked image
            }
          });
        },
        cssClass: "custom-arrow-left",  
      }
    ],
    "m_guidance.jpg": [
        {
          id: "quidanceArrow",
          pitch: -182,
          yaw: 15,
          type: "custom",  
          url: "m_clinic.jpg",  // Next panorama URL
          clickHandlerFunc: function() {
            const newPanorama = this.url;  // Get the URL of the new panorama
    
            // Destroy the existing viewer instance
            viewer.destroy();
    
            // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
            viewer = pannellum.viewer('panorama', {
              "type": "equirectangular",
              "panorama": newPanorama,  // Set the new panorama
              "autoLoad": true,
              "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
              "showControls": true
            });
    
            // Update the image holder and apply the gold border based on the new panorama URL
            const allImages = document.querySelectorAll('.gallery-image');
            allImages.forEach(image => {
              image.classList.remove('gold-border');  // Remove gold border from all images
            });
    
            // Find the corresponding image in the gallery and add the gold border
            const galleryImages = document.querySelectorAll('.gallery-image');
            galleryImages.forEach(image => {
              if (image.src.includes(newPanorama)) {
                image.classList.add('gold-border');  // Add the gold border to the clicked image
              }
            });
          },
          cssClass: "custom-arrow-left-guidance",  
        }
      ],
      "m_clinic.jpg": [
        {
          id: "clinicRight",
          pitch: -130,
          yaw: -93,
          type: "custom",  
          url: "m_clinic_room.jpg",  // Next panorama URL
          clickHandlerFunc: function() {
            const newPanorama = this.url;  // Get the URL of the new panorama
    
            // Destroy the existing viewer instance
            viewer.destroy();
    
            // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
            viewer = pannellum.viewer('panorama', {
              "type": "equirectangular",
              "panorama": newPanorama,  // Set the new panorama
              "autoLoad": true,
              "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
              "showControls": true
            });
    
            // Update the image holder and apply the gold border based on the new panorama URL
            const allImages = document.querySelectorAll('.gallery-image');
            allImages.forEach(image => {
              image.classList.remove('gold-border');  // Remove gold border from all images
            });
    
            // Find the corresponding image in the gallery and add the gold border
            const galleryImages = document.querySelectorAll('.gallery-image');
            galleryImages.forEach(image => {
              if (image.src.includes(newPanorama)) {
                image.classList.add('gold-border');  // Add the gold border to the clicked image
              }
            });
          },
          cssClass: "custom-arrow-up-clinic",  
        },
        {
          id: "clinicLeft",
          pitch: 180,
          yaw: 108,
          type: "custom",  
          url: "m_parkinglot.jpg",  // Next panorama URL
          clickHandlerFunc: function() {
            const newPanorama = this.url;  // Get the URL of the new panorama
    
            // Destroy the existing viewer instance
            viewer.destroy();
    
            // Reinitialize the viewer with the new panorama and corresponding hotspots from the hotspotsData
            viewer = pannellum.viewer('panorama', {
              "type": "equirectangular",
              "panorama": newPanorama,  // Set the new panorama
              "autoLoad": true,
              "hotSpots": hotspotsData[newPanorama] || [],  // Load hotspots for the selected panorama (if available)
              "showControls": true
            });
    
            // Update the image holder and apply the gold border based on the new panorama URL
            const allImages = document.querySelectorAll('.gallery-image');
            allImages.forEach(image => {
              image.classList.remove('gold-border');  // Remove gold border from all images
            });
    
            // Find the corresponding image in the gallery and add the gold border
            const galleryImages = document.querySelectorAll('.gallery-image');
            galleryImages.forEach(image => {
              if (image.src.includes(newPanorama)) {
                image.classList.add('gold-border');  // Add the gold border to the clicked image
              }
            });
          },
          cssClass: "custom-exit-custom",  
        }
      ],
  };
  
    // Initialize the viewer with the Ground Lobby panorama
    var viewer = pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": "m_ground_lobby.jpg",  // Initial panorama image
        "autoLoad": true,
        "hotSpots": hotspotsData["m_ground_lobby.jpg"],  // Hotspots for Ground Lobby
        "showControls": true
    });
  
    // Function to change the image when a gallery image is clicked
    function changeImage(clickedImage) {
        // Remove gold border from all images
        const allImages = document.querySelectorAll('.gallery-image');
        allImages.forEach(image => {
            image.classList.remove('gold-border');
        });

        // Add the gold border to the clicked image
        clickedImage.classList.add('gold-border');

        const imageSrc = clickedImage.src;

        // Destroy the existing viewer instance to reset
        if (viewer) {
            viewer.destroy();
        }

        // If the clicked image is "m_ground_lobby.jpg", use the corresponding hotspots
        if (imageSrc.includes("m_ground_lobby.jpg")) {
            viewer = pannellum.viewer('panorama', {
                "type": "equirectangular",
                "panorama": imageSrc,  // The clicked panorama image
                "autoLoad": true,
                "hotSpots": hotspotsData["m_ground_lobby.jpg"],  // Load hotspots for Ground Lobby
                "showControls": true
            });
        } else if (imageSrc.includes("m_guidance.jpg")) {
            viewer = pannellum.viewer('panorama', {
                "type": "equirectangular",
                "panorama": imageSrc,  // The clicked panorama image
                "autoLoad": true,
                "hotSpots": hotspotsData["m_guidance.jpg"],  // Load hotspots for Ground Lobby
                "showControls": true
            });
        } else if (imageSrc.includes("m_clinic.jpg")) {
            viewer = pannellum.viewer('panorama', {
                "type": "equirectangular",
                "panorama": imageSrc,  // The clicked panorama image
                "autoLoad": true,
                "hotSpots": hotspotsData["m_clinic.jpg"],  // Load hotspots for Ground Lobby
                "showControls": true
            });
        } else if (imageSrc.includes("m_quadrangle.jpg")) {
            viewer = pannellum.viewer('panorama', {
                "type": "equirectangular",
                "panorama": imageSrc,  // The clicked panorama image
                "autoLoad": true,
                "hotSpots": hotspotsData["m_quadrangle.jpg"],  // Load hotspots for Ground Lobby
                "showControls": true
            });
        } else if (imageSrc.includes("m_drawingroom.jpg")) {
            viewer = pannellum.viewer('panorama', {
                "type": "equirectangular",
                "panorama": imageSrc,  // The clicked panorama image
                "autoLoad": true,
                "hotSpots": hotspotsData["m_drawingroom.jpg"],  // Load hotspots for Ground Lobby
                "showControls": true
            });
        } else if (imageSrc.includes("m_classroom.jpg")) {
            viewer = pannellum.viewer('panorama', {
                "type": "equirectangular",
                "panorama": imageSrc,  // The clicked panorama image
                "autoLoad": true,
                "hotSpots": hotspotsData["m_classroom.jpg"],  // Load hotspots for Ground Lobby
                "showControls": true
            });
        } else if (imageSrc.includes("m_physicslab.jpg")) {
            viewer = pannellum.viewer('panorama', {
                "type": "equirectangular",
                "panorama": imageSrc,  // The clicked panorama image
                "autoLoad": true,
                "hotSpots": hotspotsData["m_physicslab.jpg"],  // Load hotspots for Ground Lobby
                "showControls": true
            });
        } else if (imageSrc.includes("m_boardroom.jpg")) {
            viewer = pannellum.viewer('panorama', {
                "type": "equirectangular",
                "panorama": imageSrc,  // The clicked panorama image
                "autoLoad": true,
                "hotSpots": hotspotsData["m_boardroom.jpg"],  // Load hotspots for Ground Lobby
                "showControls": true
            });
        } else {
            // For all other images, use the general hotspot data
            viewer = pannellum.viewer('panorama', {
                "type": "equirectangular",
                "panorama": imageSrc,  // The clicked panorama image
                "autoLoad": true,
                "hotSpots": hotspotsData[imageSrc] || [],  // Load hotspots for the selected panorama if available
                "showControls": true
            });
        }
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
    
    // Function to handle hotspot clicks and show the Vision and Mission popup
    function openPopupMessage() {
        // Create the popup container
        const popup = document.createElement('div');
        popup.classList.add('popup-container');
        
        // Create the content container for the Vision and Mission message
        const content = document.createElement('div');
        content.classList.add('popup-content');
    
        const image = document.createElement('img');
        image.src = 'logo.png';  // Replace with the actual image path
        image.style.width = '10%';  // Optional: Adjust the image width as needed
        image.style.height = '10%';
        image.style.borderTopLeftRadius = '5px';  // Optional: Round top corners of the image
        image.style.marginBottom = '5%';

        content.appendChild(image);

        // Vision Title
        const visionTitle = document.createElement('h2');
        visionTitle.textContent = "Vision";
        content.appendChild(visionTitle);
    
        // Vision Text
        const visionText = document.createElement('p');
        visionText.textContent = "FEU Roosevelt envisions a productive and responsible citizenry empowered through education.";
        content.appendChild(visionText);
    
        // Mission Title
        const missionTitle = document.createElement('h2');
        missionTitle.textContent = "Mission";
        content.appendChild(missionTitle);
    
        // Mission Text
        const missionText = document.createElement('p');
        missionText.textContent = "Promotes the value of resilience through a dynamic curriculum and programs that advocate teamwork and collaboration. Develops competence in lifelong learners; nurture their ability to be creative, critical thinkers, and effective communicators. Instills integrity of mind, body, and spirit throughout its community.";
        content.appendChild(missionText);
    
        // Close Button
        const closeButton = document.createElement('button');
        closeButton.textContent = "Close";
        
        // Apply the design for the button
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#FFD700';  // Yellow background
        closeButton.style.color = '#0b461b';  // Dark green text color
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '16px';
        closeButton.style.transition = 'background-color 0.3s ease';
        
        // Hover effect (for mouseover and mouseout)
        closeButton.onmouseover = function() {
        closeButton.style.backgroundColor = '#FFBF00'; // Darker yellow on hover
        };
        
        closeButton.onmouseout = function() {
        closeButton.style.backgroundColor = '#FFD700'; // Original yellow when not hovered
        };
        
        // Close button functionality
        closeButton.onclick = function() {
        document.body.removeChild(popup);  // This will remove the popup when the button is clicked
        };
        content.appendChild(closeButton);
    
        // Append the content to the popup container
        popup.appendChild(content);
    
        // Append the popup to the body
        document.body.appendChild(popup);
    }

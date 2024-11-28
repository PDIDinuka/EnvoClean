// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the menu toggle button and navigation menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Add click event listener to the menu toggle button
    menuToggle.addEventListener('click', function() {
        // Toggle the 'active' class on both the menu button and navigation menu
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close the menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = navMenu.contains(event.target) || menuToggle.contains(event.target);
        
        if (!isClickInside && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // Close the menu when window is resized above mobile breakpoint
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});
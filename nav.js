
document.addEventListener('DOMContentLoaded', function() {
    // Get the menu toggle button and navigation menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
   
    menuToggle.addEventListener('click', function() {
        // Toggle the 'active' class on both the menu button and navigation menu
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    

    document.addEventListener('click', function(event) {
        const isClickInside = navMenu.contains(event.target) || menuToggle.contains(event.target);
        
        if (!isClickInside && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
   
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

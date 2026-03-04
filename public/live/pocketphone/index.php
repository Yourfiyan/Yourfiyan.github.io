<?php
// Include the database configuration
require_once 'admin/db_config.php';
?>
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PocketPhone - Premium Pre-Owned Phones</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        /* Define custom color palette and fonts */
        :root {
            --primary-dark: #0A1534;
            --accent-gold: #F2C200;
            --light-gray: #E5E7EB;
            --charcoal-text: #1E293B;
            --white-text: #FFFFFF;
        }
        body {
            font-family: 'Inter', 'Verdana', sans-serif;
            background-color: var(--primary-dark);
            color: var(--white-text);
        }
        h1, h2, h3, .heading-font {
            font-family: 'Inter', 'Segoe UI', 'Arial Black', sans-serif;
            font-weight: 900;
        }
        .bg-primary-dark { background-color: var(--primary-dark); }
        .bg-accent-gold { background-color: var(--accent-gold); }
        .bg-light-gray { background-color: var(--light-gray); }
        .text-accent-gold { color: var(--accent-gold); }
        .text-charcoal { color: var(--charcoal-text); }
        .border-accent-gold { border-color: var(--accent-gold); }

        /* Smooth scroll for anchor links */
        html {
            scroll-behavior: smooth;
        }
        
        /* Animation for sections */
        .fade-in-section {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in-section.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
    </style>
</head>
<body class="bg-primary-dark antialiased">

    <!-- Header & Navigation -->
    <header id="header" class="bg-primary-dark bg-opacity-80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 shadow-lg">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <a href="#home" class="text-2xl font-bold heading-font">
                    Pocket<span class="text-accent-gold">Phone</span>
                </a>
                <nav class="hidden md:flex space-x-8">
                    <a href="#home" class="hover:text-accent-gold transition-colors duration-300">Home</a>
                    <a href="#why-us" class="hover:text-accent-gold transition-colors duration-300">Why Us</a>
                    <a href="#products" class="hover:text-accent-gold transition-colors duration-300">Products</a>
                    <a href="#about" class="hover:text-accent-gold transition-colors duration-300">About</a>
                </nav>
                <button id="mobile-menu-button" class="md:hidden focus:outline-none">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </div>
        </div>
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden">
            <a href="#home" class="block py-2 px-6 text-sm hover:bg-gray-700">Home</a>
            <a href="#why-us" class="block py-2 px-6 text-sm hover:bg-gray-700">Why Us</a>
            <a href="#products" class="block py-2 px-6 text-sm hover:bg-gray-700">Products</a>
            <a href="#about" class="block py-2 px-6 text-sm hover:bg-gray-700">About</a>
        </div>
    </header>

    <main>
        <!-- Section 1: Hero Section (No Changes) -->
        <section id="home" class="min-h-screen flex items-center bg-cover bg-center" style="background-image: linear-gradient(rgba(10, 21, 52, 0.8), rgba(10, 21, 52, 0.8)), url('uploads/background.png');">
            <div class="container mx-auto px-6 text-center">
                <h1 class="text-4xl md:text-6xl font-black heading-font leading-tight mb-4">
                    Premium Pre-Owned Phones.<br class="hidden md:block"> <span class="text-accent-gold">Unbeatable Prices.</span>
                </h1>
                <p class="text-lg md:text-xl max-w-3xl mx-auto mb-8">
                    Every device is 100% verified, certified, and backed by our warranty. Buy with confidence.
                </p>
                <a href="#products" class="bg-accent-gold text-primary-dark font-bold py-3 px-8 rounded-full text-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 inline-block">
                    View Our Phones
                </a>
            </div>
        </section>

        <!-- Section 2: Why Choose PocketPhone? (No Changes) -->
        <section id="why-us" class="py-20 bg-light-gray fade-in-section">
            <div class="container mx-auto px-6">
                <div class="text-center mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold text-charcoal heading-font">Why Choose <span class="text-blue-900">PocketPhone</span>?</h2>
                    <p class="text-gray-600 mt-2">Your trust is our top priority. Here's our promise to you.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    <!-- Feature 1 -->
                    <div class="bg-white p-8 rounded-lg shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                        <div class="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                           <svg class="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold text-charcoal heading-font mb-2">Rigorous 32-Point Quality Check</h3>
                        <p class="text-gray-600 text-sm">Every phone is expertly tested to ensure 100% functionality and authenticity.</p>
                    </div>
                    <!-- Feature 2 -->
                    <div class="bg-white p-8 rounded-lg shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                        <div class="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                             <svg class="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold text-charcoal heading-font mb-2">Certificate of Authenticity</h3>
                        <p class="text-gray-600 text-sm">Your purchase comes with proof that it meets the PocketPhone Standard.</p>
                    </div>
                    <!-- Feature 3 -->
                    <div class="bg-white p-8 rounded-lg shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                        <div class="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold text-charcoal heading-font mb-2">Comprehensive Warranty</h3>
                        <p class="text-gray-600 text-sm">Shop with peace of mind. Every device is backed by a valid warranty.</p>
                    </div>
                    <!-- Feature 4 -->
                    <div class="bg-white p-8 rounded-lg shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                        <div class="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                           <svg class="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8a1 1 0 001-1zM22 9h-4a1 1 0 00-1 1v6a1 1 0 001 1h4v1a2 2 0 01-2 2h-1.382a3 3 0 00-5.236 0H7a3 3 0 00-5.236 0H1a1 1 0 01-1-1v-1a1 1 0 011-1h1.382a3.001 3.001 0 005.236 0H14"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold text-charcoal heading-font mb-2">Fast & Secure Delivery</h3>
                        <p class="text-gray-600 text-sm">Operating from Jorhat & Sivasagar, we deliver quality across India.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Section 3: Featured Products -->
        <section id="products" class="py-20 bg-primary-dark fade-in-section">
            <div class="container mx-auto px-6">
                <div class="text-center mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold text-white heading-font">Featured Products</h2>
                    <p class="text-gray-300 mt-2">Hand-picked devices, certified and ready for you.</p>
                </div>
                <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    
                    <!-- PHP Product Loop Start -->
                    <?php
                    // Fetch products from database
                    $sql = "SELECT * FROM products ORDER BY id DESC";
                    $result = $conn->query($sql);

                    if ($result->num_rows > 0) {
                        // Loop through each product
                        while($row = $result->fetch_assoc()) {
                            $product_name = htmlspecialchars($row['name']);
                            $condition_desc = htmlspecialchars($row['condition_desc']);
                            $price = htmlspecialchars($row['price']);
                            // IMPORTANT: Assumes an 'uploads/' folder in the same directory as index.php
                            $image_url = "uploads/" . htmlspecialchars($row['image_path']);
                            
                            // Create dynamic WhatsApp link
                            $encoded_product_name = urlencode("Hello PocketPhone, I'm interested in the " . $product_name . " listed on your website.");
                            $whatsapp_link = "https://wa.me/919707643357?text=" . $encoded_product_name;
                    ?>

                    <!-- Dynamic Product Card Start -->
                    <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col">
                        <img src="<?php echo $image_url; ?>" alt="<?php echo $product_name; ?>" class="w-full h-56 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/400x400/E5E7EB/0A1534?text=Image+Missing';">
                        <div class="p-6 flex flex-col flex-grow">
                            <h3 class="text-xl font-bold heading-font text-white"><?php echo $product_name; ?></h3>
                            <p class="text-sm text-gray-400 mt-1"><?php echo $condition_desc; ?></p>
                            <p class="text-2xl font-black text-accent-gold my-4"><?php echo $price; ?></p>
                            <div class="mt-auto">
                                <a href="<?php echo $whatsapp_link; ?>" target="_blank" rel="noopener noreferrer" class="block w-full text-center bg-accent-gold text-primary-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors duration-300">
                                    Buy on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                    <!-- Dynamic Product Card End -->

                    <?php
                        } // End while loop
                    } else {
                        echo "<p class='text-gray-300 col-span-full text-center'>No products available at this time. Please check back later.</p>";
                    }
                    ?>
                    <!-- PHP Product Loop End -->

                </div>
            </div>
        </section>

        <!-- Section 4: About Us (No Changes) -->
        <section id="about" class="py-20 bg-light-gray fade-in-section">
            <div class="container mx-auto px-6">
                <div class="flex flex-col md:flex-row items-center gap-12">
                    <div class="md:w-1/2">
                        <img src="https://placehold.co/600x400/0A1534/F2C200?text=Our+Team" alt="PocketPhone Team" class="rounded-lg shadow-2xl w-full">
                    </div>
                    <div class="md:w-1/2 text-charcoal">
                        <h2 class="text-3xl font-bold heading-font mb-4">Welcome to PocketPhone</h2>
                        <p class="mb-4">Where trust meets technology. Founded in Jorhat, Assam, we began with a simple mission: to make premium smartphones accessible and affordable for everyone. We believe that owning a high-quality device shouldn’t break the bank.</p>
                        <p class="mb-4">At PocketPhone, we're not just selling phones; we're delivering peace of mind. Each device in our collection undergoes a rigorous 32-point inspection to ensure it meets our 'PocketPhone Standard'—a benchmark for quality, performance, and reliability. We stand by every product we sell, backing it with a certificate of authenticity and a comprehensive warranty.</p>
                        <p class="mb-6">We are a team of passionate tech enthusiasts dedicated to providing you with a transparent, trustworthy, and satisfying shopping experience.</p>
                        <p class="text-2xl italic text-center md:text-left text-blue-900 heading-font mt-8">PocketPhone — Not everything old is bad.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Section 5: How It Works (No Changes) -->
        <section id="how-it-works" class="py-20 bg-primary-dark fade-in-section">
            <div class="container mx-auto px-6">
                <div class="text-center mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold heading-font">How It Works</h2>
                    <p class="text-gray-300 mt-2">A simple and secure process from start to finish.</p>
                </div>
                <div class="relative">
                    <!-- Connecting line -->
                    <div class="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-700" style="transform: translateY(-50%);"></div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <!-- Step 1 -->
                        <div class="text-center z-10">
                            <div class="bg-accent-gold text-primary-dark w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 border-4 border-primary-dark">1</div>
                            <h3 class="text-xl font-bold heading-font mb-2">Browse & Choose</h3>
                            <p class="text-gray-400">Explore our curated selection of certified pre-owned smartphones.</p>
                        </div>
                        <!-- Step 2 -->
                        <div class="text-center z-10">
                            <div class="bg-accent-gold text-primary-dark w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 border-4 border-primary-dark">2</div>
                            <h3 class="text-xl font-bold heading-font mb-2">Contact Us on WhatsApp</h3>
                            <p class="text-gray-400">Click 'Buy on WhatsApp' to connect with our team instantly.</p>
                        </div>
                        <!-- Step 3 -->
                        <div class="text-center z-10">
                            <div class="bg-accent-gold text-primary-dark w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 border-4 border-primary-dark">3</div>
                            <h3 class="text-xl font-bold heading-font mb-2">Confirm & Receive</h3>
                            <p class="text-gray-400">We'll finalize details and ship your phone with a certificate and warranty.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer (No Changes) -->
    <footer class="bg-gray-900 text-gray-300 py-12">
        <div class="container mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <!-- Column 1: Logo and Slogan -->
                <div class="md:col-span-1">
                    <a href="#home" class="text-2xl font-bold heading-font">
                        Pocket<span class="text-accent-gold">Phone</span>
                    </a>
                    <p class="mt-4 text-sm text-gray-400 italic">Not everything old is bad.</p>
                </div>
                <!-- Column 2: Quick Links -->
                <div>
                    <h4 class="font-bold text-white mb-4">Quick Links</h4>
                    <ul class="space-y-2">
                        <li><a href="#home" class="hover:text-accent-gold transition-colors duration-300">Home</a></li>
                        <li><a href="#products" class="hover:text-accent-gold transition-colors duration-300">Products</a></li>
                        <li><a href="#about" class="hover:text-accent-gold transition-colors duration-300">About Us</a></li>
                    </ul>
                </div>
                <!-- Column 3: Legal -->
                <div>
                    <h4 class="font-bold text-white mb-4">Legal</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="hover:text-accent-gold transition-colors duration-300">Terms & Conditions</a></li>
                        <li><a href="#" class="hover:text-accent-gold transition-colors duration-300">Warranty Policy</a></li>
                    </ul>
                </div>
                <!-- Column 4: Contact Us -->
                <div>
                    <h4 class="font-bold text-white mb-4">Contact Us</h4>
                    <ul class="space-y-2 text-sm">
                        <li class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                            <span>+91 9707643357</span>
                        </li>
                        <li class="flex items-center">
                             <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                            <span>Jorhat / Sivasagar, Assam</span>
                        </li>
                    </ul>
                    <div class="flex space-x-4 mt-4">
                        <a href="https://www.instagram.com/pocketphone2025" target="_blank" rel="noopener noreferrer" class="hover:text-accent-gold transition-colors duration-300">
                             <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218 1.791.465 2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0-2a7 7 0 110 14 7 7 0 010-14zm6.406-2.34a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clip-rule="evenodd" /></svg>
                        </a>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
                <p>&copy; 2025 PocketPhone. All Rights Reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // --- Mobile Menu Toggle ---
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        // --- Close mobile menu on link click ---
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });

        // --- Animate sections on scroll ---
        const sections = document.querySelectorAll('.fade-in-section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => {
            observer.observe(section);
        });

        // --- Add shadow to header on scroll ---
        const header = document.getElementById('header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                header.classList.add('shadow-xl');
            } else {
                header.classList.remove('shadow-xl');
            }
        });

    </script>
</body>
</html>

<?php
/*
 * PocketPhone — public storefront
 * Data is fetched up top; everything below is presentation.
 */
require_once 'admin/db_config.php';

/** HTML-escape shorthand */
function e($s) {
    return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8');
}

$WHATSAPP_NUMBER = '919707643357';
$PHONE_DISPLAY   = '+91 97076 43357';
$INSTAGRAM_URL   = 'https://www.instagram.com/pocketphone2025';

/** Build a wa.me link with a prefilled message */
function wa_link($message) {
    global $WHATSAPP_NUMBER;
    return 'https://wa.me/' . $WHATSAPP_NUMBER . '?text=' . rawurlencode($message);
}

// ---- Fetch products -------------------------------------------------------
$products = [];
if ($result = $conn->query("SELECT id, name, condition_desc, price, image_path FROM products ORDER BY id DESC")) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    $result->free();
}
$conn->close();
$product_count = count($products);

// ---- SEO ------------------------------------------------------------------
$scheme    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$base_url  = $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? 'pocketphone.example') ;
$canonical = $base_url . '/';

$meta_description = 'Certified pre-owned phones from Jorhat & Sivasagar, Assam. Every device passes a 32-point inspection, ships with a certificate of authenticity, and is backed by warranty. Buy on WhatsApp.';

// Structured data: local business + current stock
$json_ld = [
    '@context' => 'https://schema.org',
    '@graph'   => [
        [
            '@type'       => 'LocalBusiness',
            '@id'         => $canonical . '#business',
            'name'        => 'PocketPhone',
            'slogan'      => 'Not everything old is bad.',
            'description' => $meta_description,
            'url'         => $canonical,
            'telephone'   => '+919707643357',
            'sameAs'      => [$INSTAGRAM_URL],
            'address'     => [
                '@type'           => 'PostalAddress',
                'addressLocality' => 'Jorhat',
                'addressRegion'   => 'Assam',
                'addressCountry'  => 'IN',
            ],
        ],
    ],
];
$item_list = [];
foreach ($products as $i => $p) {
    $numeric_price = preg_replace('/[^\d.]/', '', $p['price']);
    $item = [
        '@type'    => 'Product',
        'name'     => $p['name'],
        'image'    => $base_url . '/uploads/' . rawurlencode($p['image_path']),
        'itemCondition' => 'https://schema.org/RefurbishedCondition',
        'description'   => $p['condition_desc'],
    ];
    if ($numeric_price !== '' && $numeric_price !== '.') {
        $item['offers'] = [
            '@type'         => 'Offer',
            'price'         => $numeric_price,
            'priceCurrency' => 'INR',
            'availability'  => 'https://schema.org/InStock',
        ];
    }
    $item_list[] = ['@type' => 'ListItem', 'position' => $i + 1, 'item' => $item];
}
if ($item_list) {
    $json_ld['@graph'][] = [
        '@type'           => 'ItemList',
        'name'            => 'Certified pre-owned phones in stock',
        'itemListElement' => $item_list,
    ];
}

// Inspection checkpoints surfaced in the ticker (a sample of the full 32)
$checkpoints = [
    'Display panel', 'Touch response', 'Battery health', 'IMEI verification',
    'Biometrics', 'Rear cameras', 'Front camera', 'Microphones',
    'Speakers', 'Charging port', 'Wi-Fi & Bluetooth', 'Network bands',
    'Buttons & haptics', 'Sensors', 'Water damage check', 'Housing & frame',
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PocketPhone — Certified Pre-Owned Phones | Jorhat & Sivasagar, Assam</title>
    <meta name="description" content="<?php echo e($meta_description); ?>">
    <link rel="canonical" href="<?php echo e($canonical); ?>">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="PocketPhone">
    <meta property="og:title" content="PocketPhone — Certified Pre-Owned Phones">
    <meta property="og:description" content="<?php echo e($meta_description); ?>">
    <meta property="og:url" content="<?php echo e($canonical); ?>">
    <meta property="og:image" content="<?php echo e($base_url); ?>/uploads/background.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#050A18">

    <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Instrument+Sans:wght@400;500;600&family=Spline+Sans+Mono:wght@400;500&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="assets/css/main.css">
    <script>document.documentElement.classList.add('js');</script>

    <script type="application/ld+json"><?php echo json_encode($json_ld, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP); ?></script>
</head>
<body>
    <a class="skip-link" href="#phones">Skip to phones</a>

    <header class="site-header" id="top" data-header>
        <div class="container header-inner">
            <a href="#top" class="wordmark" aria-label="PocketPhone — back to top">
                Pocket<span>Phone</span><i class="wordmark-dot" aria-hidden="true"></i>
            </a>

            <nav class="site-nav" id="site-nav" aria-label="Primary">
                <a href="#phones" data-nav>Phones</a>
                <a href="#standard" data-nav>The Standard</a>
                <a href="#how" data-nav>How it works</a>
                <a href="#about" data-nav>About</a>
                <a href="#faq" data-nav>FAQ</a>
                <a class="btn btn-gold btn-sm nav-cta" href="<?php echo e(wa_link("Hello PocketPhone! I'd like to know what's in stock.")); ?>" target="_blank" rel="noopener noreferrer">
                    <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8Zm-3 4.4c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.2.2 1.8 2.8 4.4 3.8 2.1.9 2.6.7 3 .7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.3-1.6-.8c-.2 0-.4-.1-.6.2l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.6-.8c.1-.2.1-.4 0-.5l-.7-1.8c-.2-.5-.4-.4-.6-.4H9Z"/></svg>
                    WhatsApp us
                </a>
            </nav>

            <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
                <span class="nav-toggle-bar" aria-hidden="true"></span>
                <span class="nav-toggle-bar" aria-hidden="true"></span>
            </button>
        </div>
    </header>

    <main id="main">

        <!-- ============ HERO ============ -->
        <section class="hero" aria-labelledby="hero-title">
            <div class="hero-glow" aria-hidden="true"></div>
            <div class="container hero-grid">
                <div class="hero-copy">
                    <p class="eyebrow hero-item" style="--d:.05s">Certified pre-owned &middot; Jorhat &amp; Sivasagar, Assam</p>
                    <h1 id="hero-title" class="hero-title">
                        <span class="hero-line" style="--d:.15s">Not everything</span>
                        <span class="hero-line" style="--d:.28s"><em class="gold-sweep">old</em> is bad.</span>
                    </h1>
                    <p class="hero-sub hero-item" style="--d:.45s">
                        Every phone we sell passes a 32-point inspection, ships with its own
                        certificate, and is backed by warranty. See exactly what you're buying —
                        then talk to a real person on WhatsApp.
                    </p>
                    <div class="hero-actions hero-item" style="--d:.58s">
                        <a class="btn btn-gold btn-lg" href="#phones" data-magnetic>Browse phones</a>
                        <a class="btn btn-ghost btn-lg" href="#standard">Our 32-point standard</a>
                    </div>
                    <p class="hero-proof hero-item mono" style="--d:.7s">
                        32-point inspection <span class="dot" aria-hidden="true">&#9670;</span>
                        Certificate included <span class="dot" aria-hidden="true">&#9670;</span>
                        Warranty backed
                    </p>
                </div>

                <!-- CSS phone running its inspection -->
                <div class="hero-visual hero-item" style="--d:.35s" aria-hidden="true">
                    <div class="phone">
                        <div class="phone-notch"></div>
                        <div class="phone-screen">
                            <div class="scanline"></div>
                            <p class="scan-heading mono">PKT&nbsp;DIAGNOSTIC</p>
                            <ul class="scan-list mono">
                                <li style="--d:.9s">Display <b>PASS</b></li>
                                <li style="--d:1.5s">Battery health <b>PASS</b></li>
                                <li style="--d:2.1s">IMEI check <b>CLEAN</b></li>
                                <li style="--d:2.7s">Cameras <b>PASS</b></li>
                                <li style="--d:3.3s">Speakers <b>PASS</b></li>
                                <li style="--d:3.9s">Charging port <b>PASS</b></li>
                            </ul>
                            <p class="scan-result mono" style="--d:4.6s">32/32 &mdash; CERTIFIED</p>
                        </div>
                    </div>
                    <div class="phone-shadow"></div>
                </div>
            </div>
        </section>

        <!-- ============ CHECKPOINT TICKER ============ -->
        <div class="ticker" aria-hidden="true">
            <div class="ticker-track">
                <?php for ($t = 0; $t < 2; $t++): ?>
                <ul class="ticker-list mono">
                    <?php foreach ($checkpoints as $cp): ?>
                    <li><?php echo e($cp); ?> <span class="dot">&#9670;</span></li>
                    <?php endforeach; ?>
                </ul>
                <?php endfor; ?>
            </div>
        </div>

        <!-- ============ PRODUCTS ============ -->
        <section class="section section-dark" id="phones" aria-labelledby="phones-title">
            <div class="container">
                <div class="section-head reveal">
                    <div>
                        <p class="eyebrow">In stock</p>
                        <h2 class="section-title" id="phones-title">Certified &amp; ready to ship.</h2>
                    </div>
                    <?php if ($product_count > 0): ?>
                    <p class="stock-count mono"><?php echo str_pad((string)$product_count, 2, '0', STR_PAD_LEFT); ?> device<?php echo $product_count === 1 ? '' : 's'; ?> available</p>
                    <?php endif; ?>
                </div>

                <?php if ($product_count > 0): ?>
                <ul class="product-grid" role="list">
                    <?php foreach ($products as $i => $p):
                        $name   = e($p['name']);
                        $serial = 'PKT-' . str_pad((string)(int)$p['id'], 4, '0', STR_PAD_LEFT);
                        $wa     = wa_link("Hello PocketPhone, I'm interested in the {$p['name']} ({$serial}) listed on your website.");
                    ?>
                    <li class="product-card reveal" style="--i:<?php echo $i % 4; ?>">
                        <figure class="product-media">
                            <img src="uploads/<?php echo e($p['image_path']); ?>"
                                 alt="<?php echo $name; ?>"
                                 width="600" height="450" loading="lazy" decoding="async"
                                 onerror="this.onerror=null;this.src='https://placehold.co/600x450/0C1832/F0B43E?text=Photo+coming+soon';">
                            <span class="seal" aria-hidden="true">
                                <svg viewBox="0 0 24 24"><path fill="currentColor" d="m9.6 16.6-4.2-4.2 1.4-1.4 2.8 2.8 7.6-7.6 1.4 1.4-9 9Z"/></svg>
                            </span>
                        </figure>
                        <div class="product-body">
                            <p class="product-serial mono"><?php echo $serial; ?> &middot; certified</p>
                            <h3 class="product-name"><?php echo $name; ?></h3>
                            <p class="product-cond"><?php echo e($p['condition_desc']); ?></p>
                            <div class="product-rule" aria-hidden="true"></div>
                            <p class="product-price mono"><?php echo e($p['price']); ?></p>
                            <a class="btn btn-gold btn-block" href="<?php echo e($wa); ?>" target="_blank" rel="noopener noreferrer">
                                <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8Zm-3 4.4c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.2.2 1.8 2.8 4.4 3.8 2.1.9 2.6.7 3 .7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.3-1.6-.8c-.2 0-.4-.1-.6.2l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.6-.8c.1-.2.1-.4 0-.5l-.7-1.8c-.2-.5-.4-.4-.6-.4H9Z"/></svg>
                                Buy on WhatsApp
                            </a>
                        </div>
                    </li>
                    <?php endforeach; ?>
                </ul>
                <?php else: ?>
                <div class="empty-state reveal">
                    <p class="empty-title">New stock is on its way.</p>
                    <p class="empty-copy">We add certified phones every week. Message us and we'll tell you exactly what's coming — or find one for you.</p>
                    <a class="btn btn-gold" href="<?php echo e(wa_link('Hello PocketPhone! What phones do you have coming in stock?')); ?>" target="_blank" rel="noopener noreferrer">Ask what's coming</a>
                </div>
                <?php endif; ?>
            </div>
        </section>

        <!-- ============ THE STANDARD ============ -->
        <section class="section section-light" id="standard" aria-labelledby="standard-title">
            <div class="container standard-grid">
                <div class="cert-wrap reveal" aria-hidden="true">
                    <div class="cert">
                        <p class="cert-brand mono">POCKETPHONE &middot; CERTIFICATE OF AUTHENTICITY</p>
                        <p class="cert-big">32<span>/32</span></p>
                        <p class="cert-caption mono">CHECKS PASSED</p>
                        <dl class="cert-fields mono">
                            <div><dt>Device</dt><dd>Verified original</dd></div>
                            <div><dt>IMEI</dt><dd>Clean &middot; not reported</dd></div>
                            <div><dt>Battery</dt><dd>Health tested</dd></div>
                            <div><dt>Warranty</dt><dd>Included</dd></div>
                        </dl>
                        <div class="cert-foot">
                            <span class="cert-sign">The PocketPhone Standard</span>
                            <span class="cert-seal">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m9.6 16.6-4.2-4.2 1.4-1.4 2.8 2.8 7.6-7.6 1.4 1.4-9 9Z"/></svg>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="standard-copy">
                    <p class="eyebrow reveal">The PocketPhone Standard</p>
                    <h2 class="section-title reveal" id="standard-title">Every phone earns its certificate.</h2>
                    <p class="section-lead reveal">
                        "Pre-owned" only means uncertain when nobody checks. We check —
                        32 times, on every single device — before it's allowed anywhere near you.
                    </p>
                    <ul class="pillars" role="list">
                        <li class="pillar reveal" style="--i:0">
                            <svg class="pillar-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1.4 13.6L7.4 12.4l1.4-1.4 1.8 1.8 4.6-4.6 1.4 1.4-6 6Z"/></svg>
                            <h3>32-point inspection</h3>
                            <p>Screen, battery, cameras, ports, sensors, network — tested by hand, not assumed.</p>
                        </li>
                        <li class="pillar reveal" style="--i:1">
                            <svg class="pillar-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13Zm-5 4h8v2H8v-2Zm0 4h8v2H8v-2Z"/></svg>
                            <h3>Certificate of authenticity</h3>
                            <p>Your phone arrives with written proof it passed — including a clean IMEI check.</p>
                        </li>
                        <li class="pillar reveal" style="--i:2">
                            <svg class="pillar-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1 3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4Zm0 10h7c-.5 4.1-3.3 8-7 9V11H5V6.3l7-3.1V11Z"/></svg>
                            <h3>Warranty backed</h3>
                            <p>If something's wrong, we make it right. Exact terms come with each device — in writing.</p>
                        </li>
                        <li class="pillar reveal" style="--i:3">
                            <svg class="pillar-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 4h13v11h1.5l2.5-4h1v9h-2a3 3 0 1 1-6 0H9a3 3 0 1 1-6 0H1V4h2Zm3 15a1 1 0 1 0 2 0 1 1 0 0 0-2 0Zm10 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0ZM20 13.5V12h-1l-1 1.5h2Z"/></svg>
                            <h3>Delivered across India</h3>
                            <p>Packed and shipped securely from Jorhat &amp; Sivasagar — tracked to your door.</p>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- ============ HOW IT WORKS ============ -->
        <section class="section section-dark" id="how" aria-labelledby="how-title">
            <div class="container">
                <div class="section-head reveal">
                    <div>
                        <p class="eyebrow">How it works</p>
                        <h2 class="section-title" id="how-title">Three steps. No surprises.</h2>
                    </div>
                </div>
                <ol class="steps" role="list">
                    <li class="step reveal" style="--i:0">
                        <span class="step-num mono" aria-hidden="true">01</span>
                        <h3>Browse &amp; choose</h3>
                        <p>Every phone listed is already inspected, certified, and priced. What you see is what exists.</p>
                    </li>
                    <li class="step reveal" style="--i:1">
                        <span class="step-num mono" aria-hidden="true">02</span>
                        <h3>Chat on WhatsApp</h3>
                        <p>Talk to a real person. Ask for photos or a video of the exact unit — we'll happily send them.</p>
                    </li>
                    <li class="step reveal" style="--i:2">
                        <span class="step-num mono" aria-hidden="true">03</span>
                        <h3>Confirm &amp; receive</h3>
                        <p>We confirm payment and delivery in chat. Your phone arrives with its certificate and warranty.</p>
                    </li>
                </ol>
            </div>
        </section>

        <!-- ============ ABOUT ============ -->
        <section class="section section-light" id="about" aria-labelledby="about-title">
            <div class="container about-grid">
                <div class="about-copy">
                    <p class="eyebrow reveal">From Jorhat, with standards</p>
                    <h2 class="section-title reveal" id="about-title">A small shop with a stubborn standard.</h2>
                    <p class="reveal">
                        PocketPhone started in Jorhat, Assam, with a simple belief: a great phone
                        shouldn't cost a fortune, and a pre-owned one shouldn't be a leap of faith.
                        Too many people get burned buying used — so we built the checks we wished existed.
                    </p>
                    <p class="reveal">
                        We're not a marketplace and we're not a middleman. Every device passes through
                        our own hands and our own 32-point inspection before it's listed. If it doesn't
                        meet the PocketPhone Standard, you never see it.
                    </p>
                </div>
                <ul class="about-facts" role="list">
                    <li class="fact reveal" style="--i:0"><span class="fact-big">2</span><span class="fact-label">cities — Jorhat &amp; Sivasagar</span></li>
                    <li class="fact reveal" style="--i:1"><span class="fact-big">32</span><span class="fact-label">checks on every device</span></li>
                    <li class="fact reveal" style="--i:2"><span class="fact-big">1</span><span class="fact-label">certificate with every phone</span></li>
                </ul>
            </div>
        </section>

        <!-- ============ FAQ ============ -->
        <section class="section section-dark" id="faq" aria-labelledby="faq-title">
            <div class="container faq-wrap">
                <div class="section-head reveal">
                    <div>
                        <p class="eyebrow">Questions</p>
                        <h2 class="section-title" id="faq-title">Asked before. Answered honestly.</h2>
                    </div>
                </div>

                <div class="faq-list reveal">
                    <details class="faq-item" name="faq">
                        <summary>Are the phones original?<span class="faq-mark" aria-hidden="true"></span></summary>
                        <p>Yes. Every device is checked for authenticity and its IMEI is verified as clean — not reported lost or stolen. That verification is part of the certificate you receive.</p>
                    </details>
                    <details class="faq-item" name="faq">
                        <summary>What does "certified" actually mean?<span class="faq-mark" aria-hidden="true"></span></summary>
                        <p>It means the phone passed our 32-point inspection: display, touch, battery health, cameras, speakers, microphones, ports, sensors, network, and more. If a device fails any check, we don't sell it.</p>
                    </details>
                    <details class="faq-item" name="faq">
                        <summary>Is there a warranty?<span class="faq-mark" aria-hidden="true"></span></summary>
                        <p>Yes — every phone is backed by our warranty. The exact terms for your device are shared in writing on WhatsApp before you buy, so there's nothing to decode later.</p>
                    </details>
                    <details class="faq-item" name="faq">
                        <summary>Can I see the exact phone before buying?<span class="faq-mark" aria-hidden="true"></span></summary>
                        <p>Absolutely. Ask us on WhatsApp and we'll send photos or a live video of the exact unit — scratches, screen, battery stats, everything.</p>
                    </details>
                    <details class="faq-item" name="faq">
                        <summary>How do payment and delivery work?<span class="faq-mark" aria-hidden="true"></span></summary>
                        <p>We confirm payment options and delivery details with you in chat before anything ships. Phones are packed securely and delivered across India from Jorhat &amp; Sivasagar.</p>
                    </details>
                </div>
            </div>
        </section>

        <!-- ============ FINAL CTA ============ -->
        <section class="cta-band" aria-labelledby="cta-title">
            <div class="container cta-inner reveal">
                <h2 class="cta-title" id="cta-title">Your next phone is already certified.</h2>
                <a class="btn btn-ink btn-lg" href="<?php echo e(wa_link("Hello PocketPhone! I'd like to know what's in stock.")); ?>" target="_blank" rel="noopener noreferrer" data-magnetic>
                    <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8Zm-3 4.4c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.2.2 1.8 2.8 4.4 3.8 2.1.9 2.6.7 3 .7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.3-1.6-.8c-.2 0-.4-.1-.6.2l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.6-.8c.1-.2.1-.4 0-.5l-.7-1.8c-.2-.5-.4-.4-.6-.4H9Z"/></svg>
                    Chat on WhatsApp
                </a>
                <p class="cta-phone mono"><a href="tel:+919707643357"><?php echo e($PHONE_DISPLAY); ?></a></p>
            </div>
        </section>
    </main>

    <footer class="site-footer">
        <div class="container footer-grid">
            <div class="footer-brand">
                <a href="#top" class="wordmark">Pocket<span>Phone</span><i class="wordmark-dot" aria-hidden="true"></i></a>
                <p class="footer-slogan">Not everything old is bad.</p>
            </div>
            <nav class="footer-col" aria-label="Footer">
                <h4 class="mono">Explore</h4>
                <a href="#phones">Phones</a>
                <a href="#standard">The Standard</a>
                <a href="#how">How it works</a>
                <a href="#faq">FAQ</a>
            </nav>
            <div class="footer-col">
                <h4 class="mono">Contact</h4>
                <a href="tel:+919707643357"><?php echo e($PHONE_DISPLAY); ?></a>
                <a href="<?php echo e(wa_link('Hello PocketPhone!')); ?>" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a href="<?php echo e($INSTAGRAM_URL); ?>" target="_blank" rel="noopener noreferrer">Instagram — @pocketphone2025</a>
                <p>Jorhat &amp; Sivasagar, Assam</p>
            </div>
            <div class="footer-col">
                <h4 class="mono">Good to know</h4>
                <a href="<?php echo e(wa_link('Hello PocketPhone! Could you share your warranty terms?')); ?>" target="_blank" rel="noopener noreferrer">Warranty terms — ask us</a>
                <a href="#standard">What "certified" means</a>
            </div>
        </div>
        <div class="container footer-bar">
            <p>&copy; <?php echo date('Y'); ?> PocketPhone. All rights reserved.</p>
            <p class="mono">Certified in Assam &middot; delivered across India</p>
        </div>
    </footer>

    <script src="assets/js/main.js" defer></script>
</body>
</html>

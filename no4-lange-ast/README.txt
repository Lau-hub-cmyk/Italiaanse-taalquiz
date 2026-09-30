No.4 Lange Ast, static website
==============================

A plain HTML, CSS and JavaScript site. No build step, no server code.
Upload the whole folder (all .html files plus the assets and images folders) to the
web host over FTP. All links are relative, so the site works at the web root or in a subfolder.
You can also open index.html straight from a folder on your computer to check it.

Files
-----
index.html          Home
het-verblijf.html   The house
explore.html        Explore
village-life.html   Village life
prijzen.html        Prices
contact.html        Contact
assets/styles.css   Shared stylesheet (colours, fonts, layout)
assets/main.js      Shared script (NL/EN toggle, mobile menu)
images/             Photos (placeholders for now)

Languages
---------
Every text exists twice in each page: once in a <span class="lang-nl"> or <p class="lang-nl">,
once with class "lang-en". The NL/EN button in the header switches between them.
Dutch is the default, the choice is remembered in the browser.
The page title and meta description are in the data-nl and data-en attributes in the <head>.
Image alt texts are in data-alt-nl and data-alt-en on each <img>.
When you edit text, always edit both languages.


PLACEHOLDERS TO REPLACE
=======================

1. Images
---------
Each file below is a placeholder block with a caption. Replace each file with a real photo,
using exactly the same file name (lowercase, .jpg). The layout crops photos automatically.
Suggested sizes: hero images landscape, at least 2400 x 1350 px.
Other images portrait, at least 1200 x 1500 px. Save as JPG, around 200 to 400 KB each.

Home (index.html)
  images/home-hero-house.jpg        Hero, full width. The house seen from Lange Aststraat, timber facade.
  images/home-house-living.jpg      "The house" block. Living room with the wood stove.
  images/home-tile-village.jpg      Tile "Village life". The church square of Huise.   (priority, real village photo)
  images/home-tile-explore.jpg      Tile "Explore". Flemish Ardennes, rolling hills and a quiet road.
  images/home-sauna-hottub.jpg      "Sauna, hot tub and pool" block. Sauna and wood-fired hot tub on the terrace, evening.

The house (het-verblijf.html)
  images/verblijf-hero.jpg          Hero, full width. Timber facade of the CLT house.
  images/verblijf-living.jpg        "The house" block. Japandi living room with The Rope by Ief Spincemaille.
  images/verblijf-bedroom.jpg       "Sleeping arrangements" block. A bedroom with a double bed.
  images/verblijf-outside.jpg       "Outside" block. Terrace with sauna and hot tub, pool higher on the grounds.

Explore (explore.html)
  images/explore-hero.jpg           Hero, full width. Landscape of the Flemish Ardennes.
  images/explore-ardennes.jpg       "Flemish Ardennes" block. Cyclist on a climb in the Flemish Ardennes.
  images/explore-ghent.jpg          "Ghent" block. Ghent, the Graslei.

Village life (village-life.html)
  images/village-hero.jpg           Hero, full width. A street in Huise with the church.   (priority, real village photo)
  images/village-church-square.jpg  "Life in Huise" block. The church square of Huise.   (priority, real village photo)
  images/village-street.jpg         "A real village" block. Walkers and cyclists in the village street, cafe or baker.

Prices (prijzen.html)
  images/prijzen-hero.jpg           Hero, full width. The terrace of the house.

Contact (contact.html)
  images/contact-hero.jpg           Hero, full width. Front door and driveway.

If a new photo shows something different, also update its alt text
(alt, data-alt-nl and data-alt-en on the <img> tag).

2. Availability calendar (contact.html)
---------------------------------------
Search for: GOOGLE_CALENDAR_EMBED_URL_HERE
Replace it with the embed URL of the Google Calendar that imports the Airbnb and Booking iCal feeds.
  - In Google Calendar, add the Airbnb and Booking iCal links via "Other calendars", "From URL",
    or put them in one dedicated calendar.
  - Settings of that calendar, "Integrate calendar", copy the src URL from the embed code.
    It starts with https://calendar.google.com/calendar/embed?src=
  - Make the calendar public with "See only free/busy (hide details)".
The calendar is read only. It only shows which dates are taken. It does not take bookings.

3. Request form endpoint (contact.html)
---------------------------------------
Search for: FORM_ENDPOINT_HERE
A static page cannot send email itself. The form posts to a form to email service,
which must deliver to info@no4langeast.be.
  Option A, Formspree (formspree.io): create a form for info@no4langeast.be and replace
    FORM_ENDPOINT_HERE with its URL, for example https://formspree.io/f/xxxxxxx
    The hidden access_key field can then be removed.
  Option B, Web3Forms (web3forms.com): create an access key for info@no4langeast.be,
    replace FORM_ENDPOINT_HERE with https://api.web3forms.com/submit
    and replace WEB3FORMS_ACCESS_KEY_HERE with the access key.
Send a test request after uploading to check it arrives.

4. Owner details (contact.html)
-------------------------------
Search for: [surname]   Replace with Bruno's surname.
Search for: [phone]     Replace with the phone number.
Email (info@no4langeast.be) and address (Lange Aststraat 4a, 9750 Huise (Kruisem), Belgium)
are already filled in.

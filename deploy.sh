#!/bin/bash
#
# Copy files to ./Published directory so it can be uploaded as static files
#

# cleanup
cd Published
rm -rf *
mkdir css
mkdir js
mkdir js-min
mkdir images
mkdir jquery
mkdir jquery/images
cd ..

# copy files
cp index.html Published
cp favicon.ico Published 

cp js/json2.js Published/js
cp js/clientside_formula.js Published/js
cp js/loadUIModel.js Published/js
cp js/costModel.js Published/js
cp js/jquery.xml2json.js Published/js
cp js/jquery.stepy.js Published/js
cp js/jquery.linkselect.js Published/js
cp js/jquery.cookie.js Published/js
cp js-min/jquery.tools.min.js Published/js-min

cp css/print.css Published/css
cp css/model-style.css Published/css
cp css/jquery.stepy.css Published/css
cp css/jquery.linkselect.css Published/css

cp images/small_question_mark.jpg Published/images
cp images/loading_animation.gif Published/images
cp images/loading_background.png Published/images

cp jquery/jquery.min.js Published/jquery
cp jquery/jquery-ui.min.js Published/jquery
cp jquery/jquery-ui.min.css Published/jquery

cp jquery/images/ui-bg_flat_75_ffffff_40x100.png Published/jquery/images
cp jquery/images/ui-bg_glass_75_e6e6e6_1x400.png Published/jquery/images
cp jquery/images/ui-icons_888888_256x240.png Published/jquery/images
cp jquery/images/ui-bg_glass_65_ffffff_1x400.png Published/jquery/images
cp jquery/images/ui-icons_454545_256x240.png Published/jquery/images

<?php
/*
Plugin Name: Rikworks example plugin
Description: An extremely basic plugin with CMS backend
Author: Rikworks
Version: 0.1
*/

add_action('admin_menu', 'rw_ex_setup_menu');
 
function rw_ex_setup_menu(){
	add_menu_page( 'Rikworks Example Plugin Page', 'Rikworks Plugin', 'manage_options', 'rikworks-example-plugin', 'rw_ex_init' );
}

function rw_ex_init(){
	echo "<h1>Hello World!</h1>";
}

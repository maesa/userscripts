<?php
	class PlayerStatus {
		public $is_error = "";
		public $err_msg = "";
		public $is_online = "";
        public $game_name = "";
	}

	/**
     * Get a web file (HTML, XHTML, XML, image, etc.) from a URL.  Return an
     * array containing the HTTP server response header fields and content.
     */
    function get_web_page( $url )
    {
        $user_agent='Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

        $options = array(
        	CURLOPT_URL	=> $url,
            CURLOPT_CUSTOMREQUEST  =>"GET",        //set request type post or get
            CURLOPT_POST           =>false,        //set to GET
            CURLOPT_USERAGENT      => $user_agent, //set user agent
            //CURLOPT_COOKIEFILE     =>"cookie.txt", //set cookie file
            //CURLOPT_COOKIEJAR      =>"cookie.txt", //set cookie jar
            CURLOPT_RETURNTRANSFER => true,     // return web page
            CURLOPT_HEADER         => false,    // don't return headers
            //CURLOPT_FOLLOWLOCATION => true,     // follow redirects
            CURLOPT_ENCODING       => "",       // handle all encodings
            //CURLOPT_AUTOREFERER    => true,     // set referer on redirect
            CURLOPT_AUTOREFERER    => "http://www.google.com/bot.html",
            CURLOPT_CONNECTTIMEOUT => 120,      // timeout on connect
            CURLOPT_TIMEOUT        => 120,      // timeout on response
            CURLOPT_MAXREDIRS      => 10,       // stop after 10 redirects
        );

        $ch      = curl_init( $url );
        curl_setopt_array( $ch, $options );
        $content = curl_exec( $ch );
        $err     = curl_errno( $ch );
        $errmsg  = curl_error( $ch );
        $header  = curl_getinfo( $ch );
        // var_dump($header);
        curl_close( $ch );

        $header['errno']   = $err;
        $header['errmsg']  = $errmsg;
        $header['content'] = $content;
        return $header;
    }

    function check_prerequisites() {
    	

		if (function_exists('curl_version') == false){
			$s = new PlayerStatus();
			$s->is_error = 1;
			$s->err_msg = "cURL is NOT installed on this server";
			$s->is_online = 0;
            $s->game_name = "";
			echo json_encode($s);
			die();
		}

        $url_pattern = "/(https?:\/\/)?(steamcommunity\.com\/((id\/\w+)|(profiles\/\d+)))\/?/";
        if (!preg_match($url_pattern, $_GET["url"], $matches)) {
            $s = new PlayerStatus();
            $s->is_error = 1;
            $s->err_msg = "Invalid steamcommunity URL";
            $s->is_online = 0;
            $s->game_name = "";
            echo json_encode($s);
            die();
        }

        $json_source = get_web_page("http://steamstat.us/status.json");
        $decoded_json = json_decode($json_source['content']);
        $server_status = $decoded_json->services->community->title;
        $acceptable_status = array("Normal","Slow","Very Slow");
        
        if (!in_array($server_status, $acceptable_status)) {
            $s = new PlayerStatus();
            $s->is_error = 1;
            $s->err_msg = "Steam server is " . strtoupper($server_status);
            $s->is_online = 0;
            $s->game_name = "";
            echo json_encode($s);
            die();
        }
        
    }

    /**
    * get player online status by particular text in html page
    * Return : boolean
    */
    function is_online_game ($html_source) {
    	//search string
        $player_status = array("Currently Online","Currently In-Game");
        $pattern = "/<div class=\"profile_in_game_header\">(.*?)<\/div>/";
        preg_match($pattern, $html_source, $matches);
        
        $s = new PlayerStatus();
        $s->is_error = 0;
        $s->err_msg = "";

        switch ($matches[1]) {
            case "Currently Online":
                $s->is_online = 1;
                $s->game_name = "";
                break;
            case "Currently In-Game":
                $s->is_online = 1;
                $pattern = "/<div class=\"profile_in_game_name\">(.*?)<\/div>/";
                preg_match($pattern, $html_source, $matches);
                $s->game_name = $matches[1];
                break;
            case "Currently Offline":
                $s->is_online = 0;
                $s->game_name = "";
                break;
        }

        echo json_encode($s);
    }

	//main
    check_prerequisites();
	$url = $_GET["url"];
	$result = get_web_page( $url );
	if ( $result['errno'] != 0 ) {
		$s = new PlayerStatus();
		$s->is_error = 1;
		$s->err_msg = $result['errmsg'];
		$s->is_online = 0;
        $s->game_name = "";

		echo json_encode($s);
	}

    //we can't use CURLOPT_FOLLOWLOCATION in shared hosting, so I use this redirect_url trick
    if ($result["redirect_url"] != '') {
        $result = get_web_page( $result["redirect_url"] );
    }
	is_online_game($result['content']);
?>
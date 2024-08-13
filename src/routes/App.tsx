import { useState, useEffect } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
//import { useNavigate } from "react-router-dom";
import './App.css'

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
//const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

function generateCodeVerifier(length: number) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}

function App() {
  const [userAccessToken, setUserAccessToken] = useState("");
  const navigate = useNavigate();

  const logInWithSpotify = async () => {
    let codeVerifier = generateCodeVerifier(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);;
    window.localStorage.setItem('code_verifier', codeVerifier);
  
    const scope = 'user-read-private user-read-email user-top-read';
    const authUrl = new URL("https://accounts.spotify.com/authorize")
    const redirectUri = 'http://localhost:5173/Callback';

    const params =  {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    }
    console.log(redirectUri)
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  }
  

  function refreshToken() {
    const refreshToken = localStorage.getItem("refresh_token")
    
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken!);

    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    })
    .then((result) => result.json())
    .then((data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("expires_in", String(new Date().getTime() + data.expires_in * 1000));
      setUserAccessToken(data.access_token);
    });

  }

  function checkAccessKey() {
    let accessToken = localStorage.getItem("access_token")
    if (accessToken) {
      let expires_in = localStorage.getItem("expires_in")
      if (new Date().getTime() > Number(expires_in)) {
        console.log("Token expired")
        refreshToken();
        if (userAccessToken) {
          navigate("/Home");
        } else {
          setUserAccessToken("");
        }
      } else {
        navigate("/Home");
      }
    }
  }

  useEffect(() => {
    checkAccessKey();
  
  }, []);



  return (
    <>
      <Container>
        <Row style={{height:"30vh"}}>

        </Row>
        <Row>
          <Col className="text-center">
            <h1 className="display-1"><span className="spotifyGreenText">Spot</span>Me</h1>
            <Button className="spotify-themeify-btn" onClick={logInWithSpotify}>Log In With Spotify</Button>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default App

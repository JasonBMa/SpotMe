import { useState, useEffect } from 'react'
import { FormControl, InputGroup, Container, Button, Row, Card } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import './App.css'

function Callback() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  //const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  const [userAccessToken, setUserAccessToken] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [albums, setAlbums] = useState([]);
  const navigate = useNavigate();

  const redirectUri = 'http://localhost:5173/Callback';

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code"); //gets code from url returned from Spotify OAuth
  console.log("Code: " + code);
  getAccessToken(clientId, code)
    .then(() => {
      navigate("/Home");
    });

  async function getAccessToken(clientId: string, code: string){
    const verifier = localStorage.getItem("code_verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token, expires_in, refresh_token } = await result.json();
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    let expirationTime = new Date().getTime() + expires_in * 1000;
    localStorage.setItem("expires_in", String(expirationTime));
}

  return (
    <>
    <Container
      style={{
        width: "100vw",
        justifyContent: "center"
      }}
    >
      <Row>
        <a style={{textDecoration:'none'}}><h1><span className="title-spot">Spot</span>Me</h1></a>
      </Row>
      <Row
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-around",
          alignContent: "center",
          marginTop: '10px',
        }}
      >
        {
          albums.map((album) => {
            return <Card>
              <Card.Img
                width={200}
                src={album.images[0].url}
                style={{borderRadius: '4%',}}
              />
              <Card.Body style={{color:'white'}}>
                <Card.Title style={{
                  whiteSpace: 'wrap',
                  fontWeight: 'bold',
                  maxWidth: '200px',
                  fontSize: '18px',
                  marginTop: '10px',
                  }}
                >{album.name}</Card.Title>

                <Card.Text>{album.release_date}</Card.Text>
              </Card.Body>
            </Card>
          })
        }
      </Row>
    </Container>
    </>
  )
}

export default Callback
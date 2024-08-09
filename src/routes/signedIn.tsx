import { useState, useEffect } from 'react'
import { FormControl, InputGroup, Container, Button, Row, Card } from "react-bootstrap";
import './App.css'

function SignedIn() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  //const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [userAccessToken, setUserAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);

  const redirectUri = 'http://localhost:5173/SignedIn';

  useEffect(() => {
    // let authParams = {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/x-www-form-urlencoded",
    //   },
    //   body:
    //     "grant_type=client_credentials&client_id=" +
    //     clientId +
    //     "&client_secret=" +
    //     clientSecret,
    // };
  
    // fetch("https://accounts.spotify.com/api/token", authParams)
    //   .then((result) => result.json())
    //   .then((data) => {
    //     setAccessToken(data.access_token);
    //   });
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    console.log("Code: " + code);
    getAccessToken(clientId, code);    
  }, []);

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

    const { access_token } = await result.json();
    setUserAccessToken(access_token);
}

  async function search() {
    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
  
    // Get Artist
    const artistID = await fetch(
      "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
      artistParams
    )
      .then((result) => result.json())
      .then((data) => {
        return data.artists.items[0].id;
      });
      console.log("Search Input: " + searchInput);
      console.log("Artist ID: " + artistID);
    
    // Get Albums
    await fetch(
      "https://api.spotify.com/v1/artists/" + artistID + "/albums",
      artistParams
    )
      .then((result) => result.json())
      .then((data) => {
        setAlbums(data.items);
      });
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
      <Row>
      <InputGroup>
        <FormControl
          placeholder="Search For Artist"
          type="input"
          aria-label="Search for an Artist"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              search();
            }
          }} // search function
          onChange={(event) => setSearchInput(event.target.value)} // setSearch
          style={{
            width: "300px",
            height: "35px",
            borderWidth: "0px",
            borderStyle: "solid",
            borderRadius: "5px",
            marginRight: "10px",
            paddingLeft: "10px",
          }}
        />

        <Button onClick={search}>Search</Button>
      </InputGroup>

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

export default SignedIn

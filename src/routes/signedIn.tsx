import { useState, useEffect } from 'react'
import { FormControl, InputGroup, Container, Button, Row, Card } from "react-bootstrap";
import './App.css'

function App() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    console.log(clientId, clientSecret, accessToken);
    let authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        clientId +
        "&client_secret=" +
        clientSecret,
    };
  
    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => {
        setAccessToken(data.access_token);
      });
  }, []);
  
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
      <h1>SpotMe</h1>
      <Container>
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

                  <Card.Text style={{ fontColor: 'white'}}>{album.release_date}</Card.Text>
                </Card.Body>
              </Card>
            })
          }
        </Row>
      </Container>
    </>
  )
}

export default App

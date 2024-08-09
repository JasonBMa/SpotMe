import { useState, useEffect } from 'react'
import { FormControl, InputGroup, Container, Button, Row, Card } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import './App.css'

function Home() {
  const [userAccessToken, setUserAccessToken] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [albums, setAlbums] = useState([]);
  function logoutSpotify(){
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("expires_in")
    setUserAccessToken("");
    window.location.reload()
  }

  async function search() {
    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAccessToken,
      },
    };
      
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
      "https://api.spotify.com/v1/artists/" + artistID + "/albums", artistParams
    )
    .then((result) => result.json())
    .then((data) => {
      setAlbums(data.items);
    });
  }
    
  return (
    <Container
      style={{
      width: "100vw",
      justifyContent: "center"
      }}
    >
    <Row
      style={{
        justifyContent: "around"
      }}
    >
      <h1><span className="title-spot">Spot</span>Me</h1>
      {userAccessToken && <Button className="spotify-themeify-btn" onClick={logoutSpotify}>Logout</Button>}
          
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
    </Container>
  )
}

export default Home;
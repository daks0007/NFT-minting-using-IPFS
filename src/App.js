import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { create } from "ipfs-http-client";
import SignatureCanvas from "react-signature-canvas";
// const projectId = "2ARRnZenSoc8Y4OrrSgwUbIhjJa";
// const projectSecret = "70691d51523cb69bcda86a575a5a0f56";
// const ipfs = create({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https",
// });
// const auth =
//   "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const ipfsClient = create("https://ipfs.infura.io:5001/api/v0");

// const client = create({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https",
//   apiPath: "/api/v0",
//   headers: {
//     authorization: auth,
//   },
// });
export const StyledButton = styled.button`
  padding: 8px;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const elementRef = useRef();
  const ipfsBaseUrl = "https://ipfs.io/ipfs/";
  let name = "NFT name";

  let description = "IPFS minted nft";
  const [loading, setLoading] = useState(false);
  const [status, setstatus] = useState("");
  const [NFT, setNFTS] = useState([]);
  console.log(NFT);

  const mint = (_uri) => {
    blockchain.smartContract.methods
      .mint(blockchain.account, _uri)
      .send({ from: blockchain.account })
      .once("error", (err) => {
        console.error(err);
        setLoading(false);
        setstatus("There was an error while minting your NFT");
      })
      .then((reciept) => {
        console.log(reciept);
        setLoading(false);
        setstatus("Successfully minted your NFT");
        clearCanvas();
        dispatch(fetchData(blockchain.account));
      });
  };

  const createMetaDataAndMint = async (_name, _des, _imgBuffer) => {
    setLoading(true);
    setstatus("Uploading to IPFS");

    try {
      const addedImage = await ipfsClient.add(_imgBuffer);
      const meataDataObj = {
        name: _name,
        description: _des,
        image: ipfsBaseUrl + addedImage.path,
      };
      const addedMetaData = await ipfsClient.add(JSON.stringify(meataDataObj));
      console.log(ipfsBaseUrl + addedMetaData.path);
      mint(ipfsBaseUrl + addedMetaData.path);
    } catch (errorMsg) {
      // console.error(errorMsg);
      setLoading(false);
      setstatus(`error Uploading to IPFS ${errorMsg}`);
    }
  };
  const startMintingProcess = () => {
    createMetaDataAndMint(name, description, getImageData());
  };
  const getImageData = () => {
    const canvasEl = elementRef.current;
    let dataUrl = canvasEl.toDataURL("image/png");
    const buffer = Buffer(dataUrl.split(",")[1], "base64");
    return buffer;
  };

  const fetchMetatDataForNFTS = () => {
    setNFTS([]);
    data.allTokens.forEach((nft) => {
      fetch(nft.uri)
        .then((response) => response.json())
        .then((metaData) => {
          setNFTS((prevState) => [
            ...prevState,
            { id: nft.id, metaData: metaData },
          ]);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };
  const clearCanvas = () => {
    const canvasEl = elementRef.current;
    canvasEl.clear();
  };
  useEffect(() => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  }, [blockchain.smartContract, dispatch]);
  useEffect(() => {
    fetchMetatDataForNFTS();
  }, [data.allTokens]);

  return (
    <s.Screen>
      {blockchain.account === "" || blockchain.smartContract === null ? (
        <s.Container flex={1} ai={"center"} jc={"center"}>
          <s.TextTitle>Connect to the Blockchain</s.TextTitle>
          <s.SpacerSmall />
          <StyledButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(connect());
            }}
          >
            CONNECT
          </StyledButton>
          <s.SpacerSmall />
          {blockchain.errorMsg !== "" ? (
            <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
          ) : null}
        </s.Container>
      ) : (
        <s.Container flex={1} ai={"center"} style={{ padding: 24 }}>
          <s.TextTitle style={{ textAlign: "center" }}>
            Welcome!! mint your signature.
          </s.TextTitle>
          {loading ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: "center" }}>
                Loading...
              </s.TextDescription>{" "}
            </>
          ) : null}
          {status !== "" ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: "center" }}>
                {status}
              </s.TextDescription>{" "}
            </>
          ) : null}
          <s.SpacerLarge />
          <s.Container
            fd={"row"}
            jc={"center"}
            style={{ backgroundColor: "pink" }}
          >
            <StyledButton
              onClick={(e) => {
                e.preventDefault();
                name = prompt("enter the name of your NFT");
                description = prompt("enter the description");
                startMintingProcess();
              }}
            >
              MINT!!
            </StyledButton>
            <s.SpacerSmall />
            <StyledButton
              onClick={(e) => {
                e.preventDefault();
                clearCanvas();
              }}
            >
              Clear
            </StyledButton>
          </s.Container>
          <s.SpacerLarge />

          <SignatureCanvas
            backgroundColor="grey"
            canvasProps={{ width: 350, height: 350 }}
            ref={elementRef}
          />
          <s.SpacerLarge />
          {data.loading ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: "center" }}>
                loading...
              </s.TextDescription>
            </>
          ) : (
            NFT.map((nft, index) => {
              return (
                <s.Container
                  fd={"row"}
                  jc={"center"}
                  style={{ backgroundColor: "pink", padding: 10 }}
                  key={index}
                  // style={{ padding: 16 }}
                >
                  <s.TextTitle>{nft.metaData.name}</s.TextTitle>
                  <img
                    alt={nft.metaData.name}
                    src={nft.metaData.image}
                    width={150}
                  />
                </s.Container>
              );
            })
          )}
        </s.Container>
      )}
    </s.Screen>
  );
}

export default App;

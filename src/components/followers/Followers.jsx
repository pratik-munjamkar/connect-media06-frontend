import { useEffect, useState } from "react";
import { Container, Button, Alert } from "react-bootstrap";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { useHistory, useParams } from "react-router";
import Header from "../header/Header";


import axios from "axios";
import { toast } from 'react-toastify';
import Loader from "../Loader";

export default function Followers() {

    const history = useHistory();
    const params = useParams();

    const [followers, setFollowers] = useState([]);
    const [isLoading, setIsLoading] = useState();
    const [error, setError] = useState();

    useEffect(() => {
        //api call to get users followers
        const getFollowers = async () => {
            try {
                setIsLoading(true);
                const { data } = await axios.get(`/users/followers/${params.id}`,
                    { headers: { "token": localStorage.getItem("token") } });
                setFollowers(data);
                setIsLoading(false);
            }
            catch (err) {
                setIsLoading(false);
                setError("Couldnt fetch data from server");
                console.log(err);
            }
        }

        getFollowers();

    }, [params.id]);

    const handleRemove = async (id, userName) => {

        //api call to remove a user from followers
        try {
            setIsLoading(true);
            await axios.put(`/users/remove/${id}`, {},
                { headers: { "token": localStorage.getItem("token") } });
            setIsLoading(false);

            setFollowers(followers.filter(f => f._id !== id));
            toast.success(`removed ${userName} from followers`);
        }
        catch (err) {
            setIsLoading(false);
            setError(true);
            console.log(err);
        }

    }

    return <>
        <Header />
        <Loader isLoading={isLoading} error={error}>
            <Container>
                <div className="followingListContainer">
                    <div className="followingListLeft">
                        <button className="backArrowButton" onClick={() => { history.goBack() }}><FaLongArrowAltLeft className="backArrowIcon" /></button>
                    </div>
                    <div className="followingListRight">
                        <h1 className="followTitle" >Followers</h1>
                        {followers?.length === 0 && <Alert variant="danger" className="followedAlert">
                            You have 0 followers!
                        </Alert>}
                        <ul className="suggestionsList">
                            {
                                followers?.map(f => {
                                    return <li key={f._id} className="suggestionsListItem">
                                        <span className="suggestionsListItemLeft">
                                            <img src={f.profilePicture} alt="profilepic" className="suggestionsPic" />
                                            <span className="suggestionName">{f.userName}</span>
                                        </span>
                                        <Button onClick={() => handleRemove(f._id, f.userName)} variant="outline-primary" className="signBtn"
                                        >Remove
                                        </Button>
                                    </li>
                                })
                            }
                        </ul>
                    </div>
                </div>
            </Container>
        </Loader>
    </>
}
import { useEffect, useState } from "react";
import { Container, Button, Alert } from "react-bootstrap";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { useHistory, useParams } from "react-router";
import Header from "../header/Header";
import "./Following.css";

import axios from "axios";
import { toast } from 'react-toastify';
import Loader from "../Loader";

export default function Following() {

    const history = useHistory();

    const [following, setFollowing] = useState([]);
    const [isLoading, setIsLoading] = useState();
    const [error, setError] = useState();
    const params = useParams();

    useEffect(() => {

        //api call to get following list
        const getFollowing = async () => {
            try {
                setIsLoading(true);
                const { data } = await axios.get(`/users/following/${params.id}`,
                    { headers: { "token": localStorage.getItem("token") } });

                setFollowing(data);
                setIsLoading(false);

            }
            catch (err) {
                setIsLoading(false);
                setError(true);
                console.error(err);
            }
        }

        getFollowing();

    }, [params.id]);

    const handleUnfollow = async (id, userName) => {

        //api call to unfollow a user
        try {
            setIsLoading(true);
            await axios.put(`/users/unfollow/${id}`, {},
                { headers: { "token": localStorage.getItem("token") } });
            setIsLoading(false);

            setFollowing(following.filter(f => f._id !== id));
            toast.success(`You unfollowed ${userName}`);
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
                        <h1 className="followTitle" >Following</h1>
                        {following?.length === 0 && <Alert variant="danger" className="followedAlert">
                            You follow 0 users!
                        </Alert>}
                        <ul className="suggestionsList">
                            {
                                following?.map(f => {
                                    return <li key={f._id} className="suggestionsListItem">
                                        <span className="suggestionsListItemLeft">
                                            <img src={f.profilePicture} alt="profilepic" className="suggestionsPic" />
                                            <span className="suggestionName">{f.userName}</span>
                                        </span>
                                        <Button onClick={() => handleUnfollow(f._id, f.userName)} variant="outline-primary" className="signBtn"
                                        >Unfollow
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
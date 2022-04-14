import React from 'react';
import "./Conversation.css";

export default function Conversation({ conversation, user }) {

    const friendArray = conversation?.members?.filter(m => m._id !== user?._id)[0];

    return <div className="conversation">
        <img src={friendArray?.profilePicture} alt="profilepicture" className="conversationImg" />
        <span className="conversationText">
            {friendArray?.userName}
        </span>
    </div>
}
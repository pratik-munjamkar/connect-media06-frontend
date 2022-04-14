import React from 'react'
import "./Message.css";
import moment from "moment";

export default function Message({ msg, own }) {
    return (
        <div className={own ? "message own" : "message"}>
            <div className="messageTop">
                <img src={msg?.sender?.profilePicture} alt="messageImg" className="messageImg" />
                <p className="messageText">
                    {msg?.text}
                </p>
            </div>
            <div className="messageBottom">
                {moment(msg?.createdAt).fromNow()}
            </div>
        </div>
    )
}
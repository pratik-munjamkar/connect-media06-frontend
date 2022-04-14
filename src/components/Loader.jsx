import React from 'react';
import { Alert, Spinner } from 'react-bootstrap';

export default function Loader({ isLoading, error, children }) {
    return isLoading ? <div className='spinnerCenter'><Spinner animation="border" /></div> :
        error ? <Alert variant="danger" className='alignCenter'>
            Something went wrong. Refresh page or try again later...
        </Alert> : children
}
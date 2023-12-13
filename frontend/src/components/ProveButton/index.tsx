import React from 'react';
import { Button, styled } from '@mui/material';

const ProveButton = styled(Button)`
    width: 100%;
    align-self: flex-end;
    background: black;
    color: white;
    padding-top: 1.2rem;
    padding-bottom: 1.2rem;
    font-size: 1.4rem;
    border-radius: 10px;
    &.Mui-disabled {
        color: gray;
        background: darkgray;
    }
    :hover {
        color: white;
        background: rgb(0,0,0,.8);
    }
`

export default ProveButton;
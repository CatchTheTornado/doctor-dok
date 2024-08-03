import { DatabaseContext } from '@/contexts/db-context';
import { DatabaseAuthStatus } from '@/data/client/models';
import React, { useContext, useState } from 'react';
import { AuthorizePopup } from './authorize-popup';
import { useEffectOnce } from 'react-use';

const AuthorizationGuard: React.FC<AuthorizationGuardProps> = ({ authorized, children }) => {
    const dbContext = useContext(DatabaseContext);
    const [keepLoggedIn, setKeepLoggedIn] = useState(typeof localStorage !== 'undefined' ? localStorage.getItem("keepLoggedIn") === "true" : false)

    useEffectOnce(() => {
        if(keepLoggedIn) {
            const databaseId = localStorage.getItem("databaseId");
            const key = localStorage.getItem("key");
            if(databaseId && key) {
            dbContext?.authorize({
                databaseId: databaseId,
                key: key
            });
            }
        }
    });

    return (dbContext?.authStatus === DatabaseAuthStatus.Authorized) ? (
        <>{children}</>) : (<AuthorizePopup />);
};

export default AuthorizationGuard;
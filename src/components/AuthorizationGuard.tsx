import { DatabaseContext } from '@/contexts/db-context';
import { DatabaseAuthStatus } from '@/data/client/models';
import React, { PropsWithChildren, useContext, useState } from 'react';
import { AuthorizePopup } from './authorize-popup';
import { useEffectOnce } from 'react-use';

const AuthorizationGuard: React.FC<PropsWithChildren> = ({ children }) => {
    const dbContext = useContext(DatabaseContext);
    const [keepLoggedIn, setKeepLoggedIn] = useState(typeof localStorage !== 'undefined' ? localStorage.getItem("keepLoggedIn") === "true" : false)

    useEffectOnce(() => {
        if(keepLoggedIn) {
            const databaseId = localStorage.getItem("databaseId") as string;
            const key = localStorage.getItem("key") as string;
            dbContext?.keepLoggedIn({
                encryptedDatabaseId: databaseId,
                encryptedKey: key,
                keepLoggedIn: keepLoggedIn                
            });
            }
        });

    return (dbContext?.authStatus === DatabaseAuthStatus.Authorized) ? (
        <>{children}</>) : (<AuthorizePopup />);
};

export default AuthorizationGuard;
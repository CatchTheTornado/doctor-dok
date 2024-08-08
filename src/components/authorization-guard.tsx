import { DatabaseContext } from '@/contexts/db-context';
import { DatabaseAuthStatus } from '@/data/client/models';
import React, { PropsWithChildren, useContext, useState } from 'react';
import { AuthorizePopup } from './authorize-popup';
import { useEffectOnce } from 'react-use';
import { KeepLoggedinLoader } from './keep-loggedin-loader';

const AuthorizationGuard: React.FC<PropsWithChildren> = ({ children }) => {
    const dbContext = useContext(DatabaseContext);
    const [keepLoggedIn, setKeepLoggedIn] = useState(typeof localStorage !== 'undefined' ? localStorage.getItem("keepLoggedIn") === "true" : false)
    const [autoLoginInProgress, setAutoLoginInProgress] = useState(false);

    useEffectOnce(() => {
        if(keepLoggedIn) {
            const databaseId = localStorage.getItem("databaseId") as string;
            const key = localStorage.getItem("key") as string;
            setAutoLoginInProgress(true);
            const result = dbContext?.keepLoggedIn({
                encryptedDatabaseId: databaseId,
                encryptedKey: key,
                keepLoggedIn: keepLoggedIn                
            }).then((result) => {
                    if(!result?.success) {
                        setKeepLoggedIn(false);
                    }
                    setAutoLoginInProgress(false);
                });
            }
        });

    return (dbContext?.authStatus === DatabaseAuthStatus.Authorized) ? (
        <>{children}</>) : (<AuthorizePopup autoLoginInProgress={autoLoginInProgress} />);
};

export default AuthorizationGuard;
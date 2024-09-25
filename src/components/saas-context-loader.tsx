import { DatabaseContext } from "@/contexts/db-context";
import { SaaSContext } from "@/contexts/saas-context";
import { redirect, useSearchParams } from "next/navigation";
import { use, useContext, useEffect } from "react";
import { toast } from "sonner";

export function SaaSContextLoader() {
    const searchParams = useSearchParams();
    const saasContext = useContext(SaaSContext);
    const dbContext = useContext(DatabaseContext);
    
    useEffect(() => {
        let saasToken = searchParams?.get('saasToken')
        if (saasToken && typeof localStorage !== 'undefined' && saasToken !== localStorage.getItem('saasToken')) { // different saas token, local storage is set by previous run or by authorize
            if (dbContext?.accessToken) {
                dbContext?.logout();
                toast.success('User logged out due to changed SaaS token. I will remove saasToken from URL - please try again!');
                console.log('Changed SaasContext - user logged out');
                redirect('/');
            }
        }

        if (!saasToken) {
            saasToken = typeof localStorage !== 'undefined' ? localStorage.getItem('saasToken') : '';
        }


        saasContext.setSaasToken(saasToken ?? '');
        saasContext.loadSaaSContext(saasToken ?? '');
    }, [searchParams, dbContext?.accessToken]);

    return (
        <>
        </>
    )
    
}
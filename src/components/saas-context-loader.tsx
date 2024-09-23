import { SaaSContext } from "@/contexts/saas-context";
import { useSearchParams } from "next/navigation";
import { use, useContext, useEffect } from "react";

export function SaaSContextLoader() {
    const searchParams = useSearchParams();
    const saasContext = useContext(SaaSContext);
    
    useEffect(() => {
        const saasToken = searchParams?.get('saasToken')
        if (saasToken) {
            saasContext.setSaasToken(saasToken);
            saasContext.loadSaaSContext(saasToken);
        }
    }, [searchParams, saasContext]);

    return (
        <>
        </>
    )
    
}
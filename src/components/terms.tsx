import { use, useContext, useEffect, useState } from "react";
import { DatabaseAuthStatus, DataLoadingStatus, Term } from "@/data/client/models";
import DataLoader from "./data-loader";
import { Credenza, CredenzaContent, CredenzaDescription, CredenzaHeader, CredenzaTitle } from "./credenza";
import { Button } from "./ui/button";
import DatabaseLinkAlert from "./shared/database-link-alert";
import { DatabaseContext } from "@/contexts/db-context";
import { TermsContext } from "@/contexts/terms-context";
import { requiredTerms } from "@/terms/terms";
import { getCurrentTS } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function TermsPopup() {
  const dbContext = useContext(DatabaseContext);
  const termsContext = useContext(TermsContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [requiredTermsAccepted, setRequiredTermsAccepted] = useState<{[key: string]: boolean}>({});
  const checkTerms = () => {
    termsContext.setTermsRequired(false);

    Object.entries(requiredTerms).map(([key, term]) => {  
      const isAccepted = termsContext.terms.find((t) => t.code === key && t.key?.endsWith(dbContext?.keyLocatorHash ?? '')) ? true : false

      if(!isAccepted) {
        termsContext.setTermsRequired(true);
      } 
      setRequiredTermsAccepted(prev => ({...prev, [key]: isAccepted}));
    });
  }
  useEffect(() => {
    if(termsContext.loaderStatus === DataLoadingStatus.Success) checkTerms();      
  }, [termsContext.terms]); // we re not loading the records and keys each time new recod is added due to performance reasons


  useEffect(() => {
    termsContext.loadTerms();
  }, []); // we re not loading the records and keys each time new recod is added due to performance reasons

  return (
    <Credenza open={termsContext.termsRequired || termsContext.termsOpen} onOpenChange={(e) => { if (!e) termsContext.setTermsDialogOpen(false); }}>
      <CredenzaContent className="sm:max-w-[700px] bg-white dark:bg-zinc-950" side="top">
        <CredenzaHeader>
          <CredenzaTitle>Terms and conditions
          </CredenzaTitle>
          <CredenzaDescription>
          Please read the <a href="/content/terms">terms of service</a> and <a href="/content/privacy">privacy policy</a> before using Doctor Dok.
          </CredenzaDescription>
        </CredenzaHeader>
        <div className="bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
          <div className="h-auto overflow-auto">
            <div className="">
              <div className="p-4">
                To accept terms, please enter your name and email address and click &quot;Accept&quot;:
              </div>
              {errorMessage ? (
                <div className="p-4 m-4 border border-red-500 text-red-200">
                  {errorMessage}
                </div>
              ) : null}
              <div className="flex">
                <div className="flex">
                  <div className="p-4">
                    Name:
                  </div>
                  <div className="p-4">
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>
                <div className="flex">
                  <div className="p-4 col-span-2">
                    E-mail:
                  </div>
                  <div className="p-4">
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            
            {(dbContext?.authStatus == DatabaseAuthStatus.Authorized) ? (
              <div className="p-4 space-y-4">
                {termsContext?.loaderStatus === DataLoadingStatus.Loading ? (
                  <div className="flex justify-center">
                    <DataLoader />
                  </div>
                ) : (
                  Object.entries(requiredTerms).map(([key, term]) => (
                  <div key={key} className="w-full flex grid-cols-2">
                      <div className="w-[85%]"><strong>{term.title}</strong><br />{term.content}</div>
                      <div>
                        {termsContext?.terms.find((t) => t.code === key && t.key?.endsWith(dbContext.keyLocatorHash)) ? (
                          <div className="text-green-500">Accepted<br/><span className="text-xs">{termsContext?.terms.find((t) => t.code === key && t.key?.endsWith(dbContext.keyLocatorHash))?.signedAt}</span></div>
                        ) : (
                          <Button onClick={(e) => {
                            if (!name || !email) {
                              setErrorMessage('Please enter your name and email address');
                              return;
                            } else {
                              setErrorMessage('');                             
                              termsContext?.sign({
                                code: key,
                                name: name,
                                email: email,
                                content: term.contentPlain? term.contentPlain : term.content.toString(),
                                key: key + dbContext?.keyLocatorHash,
                                signedAt: getCurrentTS(),
                              }).then(() => {
                                setRequiredTermsAccepted(prev => ({...prev, [key]: true}));
                              });
                            }
                          }}>Accept</Button>
                        )}
                      </div>
                  </div>
                  ))
                )}
              </div>
            ) : (
              <DatabaseLinkAlert />
            )}
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}
import { useRouter } from 'next/router';
import { useState, useEffect, createContext, useContext } from 'react';
import { getCompanies, useUser, newTeam } from './useUser';

export const CompanyContext = createContext();

export const CompanyContextProvider = (props) => {
  const { user, team, userFinderLoaded, signOut } = useUser();
  const [userCompanyDetails, setUserCompanyDetails] = useState(null);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const router = useRouter();
  let value;

  useEffect(() => {
    if (userFinderLoaded && getCompanies && user && userCompanyDetails === null) {
      getCompanies(user?.id).then(results => {
        setUserCompanyDetails(Array.isArray(results) ? results : [results])
      });
    }
  });

  if(userCompanyDetails !== null && userCompanyDetails?.length === 0 && !router?.asPath?.includes('add-company') && router?.pathname !== '/dashboard/create-team'){
    if(team === 'none' && router?.pathname !== '/dashboard/create-team' && creatingTeam === false){
      setCreatingTeam(true);
      newTeam(user, {"team_name": "My team"}).then((result) => {
        router.replace('/dashboard/add-company');
      });
    }

    if(team?.team_id){
      router.replace('/dashboard/add-company');
    }
  }
  
  if(userCompanyDetails !== null && userCompanyDetails?.length > 0 && router?.asPath === '/dashboard'){
    userCompanyDetails?.filter(company=>company?.active_company === true)?.length > 0 ?      
      router.replace('/dashboard/'+userCompanyDetails?.filter(company=>company?.active_company === true)[0].company_id+'')
    : 
      router.replace('/dashboard/'+userCompanyDetails[0].company_id+'')
  }

  // if(userCompanyDetails !== null && userCompanyDetails?.length > 0 && router?.asPath?.includes('undefined')){
  //   userCompanyDetails?.filter(company=>company?.active_company === true)?.length > 0 ?      
  //     router.replace('/dashboard/'+userCompanyDetails?.filter(company=>company?.active_company === true)[0].company_id+'')
  //   : 
  //     router.replace('/dashboard/'+userCompanyDetails[0].company_id+'')
  // }

  // if(userCompanyDetails === null && router?.asPath?.includes('undefined')){
  //   signOut();
  //   router.replace('/signin');
  // }

  let activeCompany = router?.query?.companyId ? userCompanyDetails?.filter(company => company?.company_id === router?.query?.companyId) : userCompanyDetails?.filter(company => company?.active_company === true)?.length > 0 ? userCompanyDetails?.filter(company => company?.active_company === true) : Array.isArray(userCompanyDetails) ? userCompanyDetails[0] : userCompanyDetails;
  if(Array.isArray(activeCompany)){
    activeCompany = activeCompany[0]
  }

  value = {
    activeCompany,
    userCompanyDetails
  };

  return <CompanyContext.Provider value={value} {...props}  />;
}

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a CompanyContextProvider.`);
  }
  return context;
};
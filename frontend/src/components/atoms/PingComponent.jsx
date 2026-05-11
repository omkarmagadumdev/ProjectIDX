import usePing from "../../hooks/apis/queries/usePing";

const PingComponent = ()=>{
    const { isLoading,data } =  usePing();

    if(isLoading){
      return(
        <>
          Loading...
        </>
      )
    }

    return(
        <>
        {data.message}
        </>
    )
    
}

export default PingComponent;

import React, { useEffect, useState } from 'react';
import {  useSelector } from 'react-redux'; 


import PostModal from '../PostModal/PostModal'; 
import EditPostModal from '../EditPostModal/EditPostModal'; 

import styles from './Home.module.css';
import Feed from '../Feed/Feed'; 



const Home = () => {
  console.log('Home component RENDERED/MOUNTED');



  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  



  
  const currentUser = useSelector(state => state.auth.user); 



  useEffect(() => {
    console.log('Home component useEffect TRIGGERED, currentUser:', currentUser);



    setLoading(false); 
  }, [currentUser]);


  if (loading) {
    return (
      <div className={styles.container}> {}
        <div className={styles.loadingSpinner}> {}
          Загрузка страницы...
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className={styles.container}> {}
        <div className={styles.error}> {}
          {error}
          {}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}> {}
      {}
      {}
      <Feed /> 

      {}
      {}
      {}
    </div>
  );
};

export default Home; 
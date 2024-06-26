import { useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import axios, { AxiosError } from 'axios';

const useFetchFirstName = (): string => {
  const [firstName, setFirstName] = useState<string>("");

  const fetchUser = async () => {
    const firebaseId = auth.currentUser?.uid;

    if (!firebaseId) {
      console.error('No user is signed in');
      return;
    }

    try {
      const res = await axios.get<{ firstName: string }>(`/api/users/${firebaseId}`);
      setFirstName(res.data.firstName);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error(axiosError.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return firstName;
};

export default useFetchFirstName;

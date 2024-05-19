import * as yup from 'yup';

const signInSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email address').required('Email is required'),
  firebaseId: yup.string().required('Firebase ID is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters long').required('Password is required'),
  // Ajoute d'autres champs au besoin
});

export default signInSchema;

import React from "react";
import { useField, Formik, Form } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import styles from "./styles.module.css";
const MyTextField = ({ label, name }: { label: string; name: string }) => {
  const [field, meta] = useField(name);
  return (
    <>
      <label htmlFor={name}>{label}:</label>
      <input id={name} {...field} type="text" />
      {meta.touched && meta.error ? (
        <div className={styles.error}>{meta.error}</div>
      ) : null}
    </>
  );
};
const AddProductSchema = Yup.object().shape({
  ean: Yup.string()
    .required("Required")
    .length(13)
    .matches(/^[0-9]+$/, "Must be number"),
  name: Yup.string().required()
});
const ProductsQuery = gql`
  {
    products {
      id
      name
    }
  }
`;
const CreateProductMutation = gql`
  mutation($id: String!, $name: String!, $price: Int!) {
    createProduct(id: $id, name: $name, price: $price) {
      id
    }
  }
`;
type AddProductPageProps = {};
const AddProductPage: React.FC<AddProductPageProps> = () => {
  const { loading, error, data } = useQuery(ProductsQuery);
  const [createProduct] = useMutation(CreateProductMutation, {
    refetchQueries: () => [{ query: ProductsQuery }]
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div className="AddProductPage">
      {data.products.map((product: any) => (
        <div>
          {product.id} {product.name}
        </div>
      ))}
      <Formik
        initialValues={{ ean: "", name: "" }}
        onSubmit={async (values, actions) => {
          await createProduct({
            variables: { id: values.ean, name: values.name, price: 300_00 }
          });
          actions.resetForm();
          actions.setSubmitting(false);
        }}
        validationSchema={AddProductSchema}
      >
        <Form className={styles.form}>
          <MyTextField name="ean" label="EAN" />
          <MyTextField name="name" label="product name" />
          <button type="submit" className={styles.btn}>
            submit
          </button>
        </Form>
      </Formik>
    </div>
  );
};
export default AddProductPage;

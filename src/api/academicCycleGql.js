import { gql } from '@apollo/client';

export const GET_ACADEMIC_CYCLES = gql`
  query GetAcademicCycles {
    academic_academicyears(order_by: {start_date: desc}) {
      id
      name
      start_date
      end_date
      status
      terms(order_by: {start_date: asc}) {
        id
        name
        start_date
        end_date
      }
    }
  }
`;

export const CREATE_ACADEMIC_YEAR = gql`
  mutation CreateAcademicYear($object: AcademicYearInput!) {
    CreateAcademicYearAction(object: $object) {
      id
      name
      status
    }
  }
`;

export const CREATE_TERM = gql`
  mutation CreateTerm($object: TermInput!) {
    CreateTermAction(object: $object) {
      id
      name
      academic_year_id
    }
  }
`;
import { gql } from '@apollo/client';

export const CREATE_CLASSES_BULK = gql`
  mutation CreateClassesBulk($object: ClassesBulkInput!) {
    CreateClassesBulkAction(object: $object) {
      results
      classes {
        id
        section_id
        capacity
      }
    }
  }
`;

export const GET_CLASSES_FULL_DATA = gql`
  query GetClassesFullData {
    academic_classes(order_by: {created_at: desc}) {
      id
      name
      description
      grade_level
      capacity
      section_id
      created_at
      # Academic Year & Terms
      academicyear {
        id
        name
        status
        start_date
        end_date
        terms {
          id
          name
          start_date
          end_date
        }
      }
      # Section -> Grade -> Enrollment
      section {
        id
        name
        grade_id
        grade {
          id
          name
          level_order
        }
        studentenrollments_aggregate {
          aggregate {
            count
          }
        }
      }
    }
    # Metadata for Dropdowns
    academic_sections {
      id
      name
      grade {
        name
      }
    }
    academic_academicyears(where: {status: {_eq: "active"}}) {
      id
      name
    }
  }
`;
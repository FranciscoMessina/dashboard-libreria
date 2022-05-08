import {
  ActionIcon,
  Center,
  Container,
  createStyles,
  Divider,
  Group,
  Loader,
  Pagination,
  Stack,
  UnstyledButton
} from '@mantine/core'
import { useDocumentTitle } from '@mantine/hooks'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { NavLink, useSearchParams } from 'react-router-dom'
import { Settings } from 'tabler-icons-react'
import { HistoryQuestion } from '../components/question/HistoryQuestion.js'
import { useAxiosInstance } from '../hooks/useAxios.js'
import { useGetQuestionsQuery } from '../hooks/useGetQuestionsQuery'
import { MeliApiError, MeliQuestionData, MeliQuestionsResponse } from '../types/types.js'

const useStyles = createStyles((theme) => ({
  link: {
    textDecoration: 'none',
    color: 'white',
    padding: '10px',
    borderRadius: '3px',
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0]
    }
  },
  linkActive: {
    '&, &:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
          : theme.colors[theme.primaryColor][0],
      color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 7]
    }
  }
}))

export default function QuestionsHistory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { classes, cx } = useStyles()
  const [offset, setOffset] = useState(0)
  const axios = useAxiosInstance()

  const from = searchParams.get('from')
  const itemId = searchParams.get('itemId')

  const stringParams = [
    from ? `from=${from}` : '',
    itemId ? `itemId=${itemId}` : '',
    `offset=${offset}`
  ]
    .filter(Boolean)
    .join('&')

  console.log(stringParams);
  

  const questionsData = useQuery(
    ['questions-history', offset],
    () => axios.get<MeliQuestionsResponse>(`/meli/questions?history=true&${stringParams}`),
    {
      keepPreviousData: true
    }
  )

  const { data, isLoading, error, isError, isFetching, isSuccess } = questionsData

  console.log(data?.data)

  useDocumentTitle(`Historial de Preguntas - El Rio Libros`)

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    )
  }

  if (isError) {
    // @ts-ignore
    return <Center>Algo salio mal, aca el error: {error?.message}</Center>
  }

  return (
    <Container size={1500}>
      <NavLink to="/questions" className={classes.link}>
        Pendientes
      </NavLink>

      <NavLink to="/questions/history" style={{ marginLeft: '5px'}} className={cx(classes.link, { [classes.linkActive]: true })}>
        Historial
      </NavLink>

      <Divider mb="sm" mt="xs" />
      <Group position="center" align="center" sx={{ width: '100%' }}>
        {data?.data?.total! > 0 && (
          <Stack sx={{ width: '100%' }}>
            {data?.data.results.map((question: MeliQuestionData) => (
              <HistoryQuestion question={question} key={question.id} />
            ))}
            <Stack>
              {isFetching && (
                <Center>
                  <Loader variant="dots" />
                </Center>
              )}
              {isSuccess && data?.data.limit < data?.data.total && (
                <Center>
                  <Pagination
                    onChange={(page) => {
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      })
                      setOffset(page === 1 ? 0 : (page - 1) * data.data.limit)
                    }}
                    total={Math.ceil(data?.data.total! / data?.data.limit!)}
                  />
                </Center>
              )}
            </Stack>
          </Stack>
        )}
      </Group>
    </Container>
  )
}

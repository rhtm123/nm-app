import { useState, useEffect } from "react"

export const useApi = (apiFunction, params = null, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction(params)
      console.log('API RESULT:', result)

      if (result.success) {
        setData(result.data)
        console.log('API CALL: fetchData', result.data);
      } else {
        setError(result.error)
        console.log('API ERROR:', result.error)
      }
    } catch (err) {
      setError(err.message || "An error occurred")
      console.log('API CATCH ERROR:', err)
    } finally {
      setLoading(false)
      console.log('API LOADING:', loading)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  const refetch = () => {
    fetchData()
  }

  return { data, loading, error, refetch }
}

export const useApiMutation = (apiFunction) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = async (params) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction(params)

      if (result.success) {
        return result.data
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

import { Resource } from '~/models/Resource'

const resourceService = {
  getResources: async (userId: string) => {
    try {
      const resources = await Resource.find({
        userId
      })
      return resources
    } catch (error: any) {
      throw new Error(error.message)
    }
  },
  getResource: async (userId: string, resourceId: string) => {
    try {
      const resource = await Resource.findOne({
        _id: resourceId,
        userId
      })
      return resource
    } catch (error: any) {
      throw new Error(error.message)
    }
  },
  createResource: async () => {},
  updateResource: async () => {},
  deleteResource: async () => {},
  deleteResources: async () => {}
}
export default resourceService

import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { anyone, isStaff } from '../access/roles'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Maquettes 3D au format .glb (export SketchUp, Revit, Blender…), affichées sur les fiches
 * projet avec rotation, zoom et réalité augmentée sur téléphone.
 * Conseil : rester sous 5 Mo pour les connexions lentes (compression Draco ou textures réduites).
 */
export const Models3D: CollectionConfig = {
  slug: 'models',
  labels: {
    singular: { fr: 'Maquette 3D', en: '3D model' },
    plural: { fr: 'Maquettes 3D', en: '3D models' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'filesize'],
    group: { fr: 'Contenu', en: 'Content' },
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  upload: {
    staticDir: path.resolve(dirname, '../../media/models'),
    mimeTypes: ['model/gltf-binary', 'application/octet-stream'],
  },
  fields: [
    { name: 'title', type: 'text', label: { fr: 'Titre', en: 'Title' }, required: true, localized: true },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Image d’aperçu', en: 'Poster image' },
      admin: {
        description: {
          fr: 'Affichée avant le chargement de la maquette (qui ne se télécharge que si le visiteur le demande).',
          en: 'Shown before the model loads.',
        },
      },
    },
    {
      name: 'cameraOrbit',
      type: 'text',
      label: { fr: 'Angle de vue initial', en: 'Initial camera orbit' },
      defaultValue: '35deg 70deg auto',
      admin: { description: { fr: 'Rotation, inclinaison, distance. Ex. 35deg 70deg auto', en: 'e.g. 35deg 70deg auto' } },
    },
  ],
}

from pydantic import BaseModel


class PlaceResponse(BaseModel):
    id: int
    name: str
    continent: str
    image_url: str

    is_beach: bool
    is_party: bool
    is_metro: bool
    is_nature: bool
    is_family_friendly: bool

    class Config:
        from_attributes = True
from pydantic import BaseModel

class SeriesDeportivas(BaseModel):
    ph: float
    pr: float
    formato: list[bool]
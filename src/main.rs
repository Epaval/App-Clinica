use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
    routing::{delete, get, post, put},
    Router,
};
use sqlx::{PgPool, Row};
use serde::{Deserialize, Serialize};
use std::env;
use tokio;
use chrono::{DateTime, Utc, NaiveDate, NaiveDateTime}; // Agregamos NaiveDateTime

#[derive(Serialize, Deserialize)]
struct Paciente {
    id: Option<i32>,
    nombre: String,
    apellido: String,
    ci: String,
    telefono: String,
    email: String,
    fecha_nacimiento: NaiveDate,
    sexo: String,
}

#[derive(Serialize, Deserialize)]
struct PacienteConEdad {
    id: i32,
    nombre: String,
    apellido: String,
    ci: String,
    telefono: String,
    email: String,
    fecha_nacimiento: NaiveDate,
    sexo: String,
    edad: i32,
}

#[derive(Serialize, Deserialize)]
struct Expediente {
    id: i32,
    paciente_id: i32,
    fecha_creacion: NaiveDateTime, // Cambiado a NaiveDateTime
}

#[derive(Serialize, Deserialize)]
struct ExpedienteDiagnostico {
    id: i32,
    expediente_id: i32,
    diagnostico: String,
    tratamiento: Option<String>,
    fecha_registro: NaiveDateTime, // Cambiado a NaiveDateTime
}

#[derive(Serialize, Deserialize)]
struct NuevoExpedienteDiagnostico {
    diagnostico: String,
    tratamiento: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct Rol {
    id: i32,
    nombre: String,
}

#[derive(Serialize, Deserialize)]
struct Usuario {
    id: Option<i32>,
    nombre: String,
    apellido: String,
    telefono: String,
    email: String,
    fecha_nacimiento: NaiveDate,
    sexo: String,
    rol_id: i32,
    contrasena_hash: String,
}

#[derive(Serialize, Deserialize)]
struct UsuarioConRol {
    id: i32,
    nombre: String,
    apellido: String,
    telefono: String,
    email: String,
    fecha_nacimiento: NaiveDate,
    sexo: String,
    rol_id: i32,
    rol_nombre: String,
}

// --- FUNCIONES DE RUTAS ---

// GET /pacientes
async fn get_pacientes(State(pool): State<PgPool>) -> Result<Json<Vec<PacienteConEdad>>, StatusCode> {
    let rows = sqlx::query(
        "SELECT id, nombre, apellido, ci, telefono, email, fecha_nacimiento, sexo, EXTRACT(YEAR FROM AGE(fecha_nacimiento))::INTEGER AS edad FROM pacientes"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error en la consulta: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let pacientes: Vec<PacienteConEdad> = rows
        .into_iter()
        .map(|row| PacienteConEdad {
            id: row.get("id"),
            nombre: row.get("nombre"),
            apellido: row.get("apellido"),
            ci: row.get("ci"),
            telefono: row.get("telefono"),
            email: row.get("email"),
            fecha_nacimiento: row.get("fecha_nacimiento"),
            sexo: row.get("sexo"),
            edad: row.get("edad"),
        })
        .collect();

    Ok(Json(pacientes))
}

// POST /pacientes
async fn create_paciente(
    State(pool): State<PgPool>,
    Json(paciente): Json<Paciente>,
) -> Result<Json<Paciente>, StatusCode> {
    let result = sqlx::query(
        "INSERT INTO pacientes (nombre, apellido, ci, telefono, email, fecha_nacimiento, sexo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id"
    )
    .bind(&paciente.nombre)
    .bind(&paciente.apellido)
    .bind(&paciente.ci)
    .bind(&paciente.telefono)
    .bind(&paciente.email)
    .bind(paciente.fecha_nacimiento)
    .bind(&paciente.sexo)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al crear paciente: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let id = result.get("id");

    Ok(Json(Paciente {
        id: Some(id),
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        ci: paciente.ci,
        telefono: paciente.telefono,
        email: paciente.email,
        fecha_nacimiento: paciente.fecha_nacimiento,
        sexo: paciente.sexo,
    }))
}

// GET /pacientes/:id
async fn get_paciente_by_id(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<PacienteConEdad>, StatusCode> {
    let row = sqlx::query(
        "SELECT id, nombre, apellido, ci, telefono, email, fecha_nacimiento, sexo, EXTRACT(YEAR FROM AGE(fecha_nacimiento))::INTEGER AS edad FROM pacientes WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al obtener paciente: {}", e);
        if e.as_database_error().map_or(false, |db_err| {
            db_err.code().map_or(false, |code| code == "23505")
        }) {
            StatusCode::CONFLICT
        } else {
            StatusCode::NOT_FOUND
        }
    })?;

    let paciente = PacienteConEdad {
        id: row.get("id"),
        nombre: row.get("nombre"),
        apellido: row.get("apellido"),
        ci: row.get("ci"),
        telefono: row.get("telefono"),
        email: row.get("email"),
        fecha_nacimiento: row.get("fecha_nacimiento"),
        sexo: row.get("sexo"),
        edad: row.get("edad"),
    };

    Ok(Json(paciente))
}

// PUT /pacientes/:id
async fn update_paciente(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
    Json(paciente): Json<Paciente>,
) -> Result<Json<Paciente>, StatusCode> {
    sqlx::query(
        "UPDATE pacientes SET nombre = $1, apellido = $2, ci = $3, telefono = $4, email = $5, fecha_nacimiento = $6, sexo = $7 WHERE id = $8"
    )
    .bind(&paciente.nombre)
    .bind(&paciente.apellido)
    .bind(&paciente.ci)
    .bind(&paciente.telefono)
    .bind(&paciente.email)
    .bind(paciente.fecha_nacimiento)
    .bind(&paciente.sexo)
    .bind(id)
    .execute(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al actualizar paciente: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(Paciente {
        id: Some(id),
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        ci: paciente.ci,
        telefono: paciente.telefono,
        email: paciente.email,
        fecha_nacimiento: paciente.fecha_nacimiento,
        sexo: paciente.sexo,
    }))
}

// DELETE /pacientes/:id
async fn delete_paciente(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM pacientes WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|e| {
            eprintln!("Error al eliminar paciente: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(StatusCode::NO_CONTENT)
}

// GET /expedientes/{paciente_id}
async fn get_expediente_by_paciente(
    Path(paciente_id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<Expediente>, StatusCode> {
    let row = sqlx::query(
        "SELECT id, paciente_id, fecha_creacion FROM expedientes WHERE paciente_id = $1"
    )
    .bind(paciente_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al obtener expediente: {}", e);
        StatusCode::NOT_FOUND
    })?;

    let expediente = Expediente {
        id: row.get("id"),
        paciente_id: row.get("paciente_id"),
        fecha_creacion: row.get("fecha_creacion"),
    };

    Ok(Json(expediente))
}

// GET /expedientes/{paciente_id}/diagnosticos
async fn get_diagnosticos_by_expediente(
    Path(paciente_id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<ExpedienteDiagnostico>>, StatusCode> {
    let row = sqlx::query("SELECT id FROM expedientes WHERE paciente_id = $1")
        .bind(paciente_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            eprintln!("Expediente no encontrado para paciente {}: {}", paciente_id, e);
            StatusCode::NOT_FOUND
        })?;

    let expediente_id: i32 = row.get("id");

    let rows = sqlx::query(
        "SELECT id, expediente_id, diagnostico, tratamiento, fecha_registro FROM expedientes_diagnosticos WHERE expediente_id = $1"
    )
    .bind(expediente_id)
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al obtener diagnósticos: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let diagnosticos: Vec<ExpedienteDiagnostico> = rows
        .into_iter()
        .map(|row| ExpedienteDiagnostico {
            id: row.get("id"),
            expediente_id: row.get("expediente_id"),
            diagnostico: row.get("diagnostico"),
            tratamiento: row.get("tratamiento"),
            fecha_registro: row.get("fecha_registro"),
        })
        .collect();

    Ok(Json(diagnosticos))
}

// POST /expedientes/{paciente_id}/diagnosticos
async fn create_diagnostico(
    Path(paciente_id): Path<i32>,
    State(pool): State<PgPool>,
    Json(diagnostico_data): Json<NuevoExpedienteDiagnostico>,
) -> Result<Json<ExpedienteDiagnostico>, StatusCode> {
    let row = sqlx::query("SELECT id FROM expedientes WHERE paciente_id = $1")
        .bind(paciente_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            eprintln!("Expediente no encontrado para paciente {}: {}", paciente_id, e);
            StatusCode::NOT_FOUND
        })?;

    let expediente_id: i32 = row.get("id");

    let result = sqlx::query(
        "INSERT INTO expedientes_diagnosticos (expediente_id, diagnostico, tratamiento) VALUES ($1, $2, $3) RETURNING id, fecha_registro"
    )
    .bind(expediente_id)
    .bind(&diagnostico_data.diagnostico)
    .bind(&diagnostico_data.tratamiento)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al crear diagnóstico: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let id = result.get("id");
    let fecha_registro = result.get("fecha_registro");

    let nuevo_diagnostico = ExpedienteDiagnostico {
        id,
        expediente_id,
        diagnostico: diagnostico_data.diagnostico,
        tratamiento: diagnostico_data.tratamiento,
        fecha_registro,
    };

    Ok(Json(nuevo_diagnostico))
}

// GET /usuarios
async fn get_usuarios(State(pool): State<PgPool>) -> Result<Json<Vec<UsuarioConRol>>, StatusCode> {
    let rows = sqlx::query(
        "SELECT u.id, u.nombre, u.apellido, u.telefono, u.email, u.fecha_nacimiento, u.sexo, u.rol_id, r.nombre AS rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error en la consulta de usuarios: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let usuarios: Vec<UsuarioConRol> = rows
        .into_iter()
        .map(|row| UsuarioConRol {
            id: row.get("id"),
            nombre: row.get("nombre"),
            apellido: row.get("apellido"),
            telefono: row.get("telefono"),
            email: row.get("email"),
            fecha_nacimiento: row.get("fecha_nacimiento"),
            sexo: row.get("sexo"),
            rol_id: row.get("rol_id"),
            rol_nombre: row.get("rol_nombre"),
        })
        .collect();

    Ok(Json(usuarios))
}

// POST /usuarios
async fn create_usuario(
    State(pool): State<PgPool>,
    Json(usuario): Json<Usuario>,
) -> Result<Json<Usuario>, StatusCode> {
    let result = sqlx::query(
        "INSERT INTO usuarios (nombre, apellido, telefono, email, fecha_nacimiento, sexo, rol_id, contrasena_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id"
    )
    .bind(&usuario.nombre)
    .bind(&usuario.apellido)
    .bind(&usuario.telefono)
    .bind(&usuario.email)
    .bind(usuario.fecha_nacimiento)
    .bind(&usuario.sexo)
    .bind(usuario.rol_id)
    .bind(&usuario.contrasena_hash)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al crear usuario: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let id = result.get("id");

    Ok(Json(Usuario {
        id: Some(id),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        telefono: usuario.telefono,
        email: usuario.email,
        fecha_nacimiento: usuario.fecha_nacimiento,
        sexo: usuario.sexo,
        rol_id: usuario.rol_id,
        contrasena_hash: usuario.contrasena_hash,
    }))
}

// --- FIN DE FUNCIONES ---

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL debe estar configurado");

    let pool = PgPool::connect(&database_url)
        .await
        .expect("No se pudo conectar a la base de datos");

    let app = Router::new()
        //rutas para pacientes
        .route("/pacientes", get(get_pacientes).post(create_paciente))
        .route("/pacientes/:id", get(get_paciente_by_id).put(update_paciente).delete(delete_paciente))
        //rutas para expedientes
        .route("/expedientes/:paciente_id", get(get_expediente_by_paciente))
        .route("/expedientes/:paciente_id/diagnosticos", get(get_diagnosticos_by_expediente).post(create_diagnostico))
        //rutas para usuarios
        .route("/usuarios", get(get_usuarios).post(create_usuario))
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    println!("Servidor corriendo en http://0.0.0.0:3000");

    axum::serve(listener, app).await.unwrap();
}